import type { Multimedia, ScannerMessage } from "./types";
import { saveWatchlist, sendScannerMessage } from "./extensionApi/scanner";

type ImdbText = {
  text?: string;
};

type ImdbCreditGroup = {
  grouping?: ImdbText;
  credits?: Array<{
    name?: {
      nameText?: ImdbText;
    };
  }>;
};

type ImdbListItem = {
  id?: string;
  releaseYear?: {
    year?: number;
    endYear?: number;
  };
  titleType?: {
    id?: string;
    canHaveEpisodes?: boolean;
  };
  principalCreditsV2?: ImdbCreditGroup[];
  titleText?: ImdbText;
  primaryImage?: {
    url?: string;
  };
  runtime?: {
    seconds?: number;
  };
  originalRuntime?: {
    seconds?: number;
  };
  ratingsSummary?: {
    aggregateRating?: number;
  };
  metacritic?: {
    metascore?: {
      score?: number;
    };
  };
  plot?: {
    plotText?: {
      plainText?: string;
    };
  };
};

type ImdbNextData = {
  props?: {
    pageProps?: {
      mainColumnData?: {
        predefinedList?: {
          titleListItemSearch?: {
            edges?: Array<{ listItem: ImdbListItem }>;
            total?: number;
          };
        };
      };
    };
  };
};

type WatchlistPageData = {
  items: Multimedia[];
  total: number;
};

void (async function () {
  const MAX_PAGES = 100;

  const formatRuntime = (seconds?: number): string => {
    if (!seconds) return "";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return [hours ? `${hours}h` : "", minutes ? `${minutes}m` : ""].filter(Boolean).join(" ");
  };

  const constructMultimediaFromListItem = (listItem: ImdbListItem): Multimedia => {
    const year = listItem.releaseYear?.year;
    const endYear = listItem.releaseYear?.endYear;
    const titleType = listItem.titleType?.id || "";
    const isSeries = listItem.titleType?.canHaveEpisodes || /series|episode/i.test(titleType);
    const credits = (listItem.principalCreditsV2 || []).map((group) => {
      const names = (group.credits || [])
        .map((credit) => credit.name?.nameText?.text)
        .filter((name): name is string => Boolean(name));
      const label = group.grouping?.text;
      return label ? `${label}: ${names.join(", ")}` : names.join(", ");
    });

    return {
      titleId: listItem.id || "",
      title: listItem.titleText?.text || "",
      multimediaHref: listItem.id ? `https://www.imdb.com/title/${listItem.id}/` : "",
      imgSrc: listItem.primaryImage?.url || "",
      year: year ? `${year}${endYear ? `–${endYear}` : ""}` : "",
      runtime: formatRuntime(listItem.runtime?.seconds || listItem.originalRuntime?.seconds),
      genres: "",
      ratingIMDB: listItem.ratingsSummary?.aggregateRating?.toString() || "",
      ratingMetac: listItem.metacritic?.metascore?.score?.toString() || "",
      plot: listItem.plot?.plotText?.plainText || "",
      credits,
      multimediaType: isSeries ? "series" : "movie",
    };
  };

  const pageUrl = (page: number): string => {
    const url = new URL(window.location.href);
    // Detailed view includes posters, plots, credits, ratings, and all 250
    // list items in IMDb's embedded page data.
    url.searchParams.set("view", "detailed");
    url.searchParams.set("page", String(page));
    url.searchParams.delete("start");
    return url.href;
  };

  const fetchPage = async (page: number): Promise<Document> => {
    const response = await fetch(pageUrl(page), {
      credentials: "include",
      headers: { Accept: "text/html" },
    });
    if (!response.ok) {
      throw new Error(`IMDb returned ${response.status} for page ${page}.`);
    }
    const html = await response.text();
    return new DOMParser().parseFromString(html, "text/html");
  };

  const extractPageData = (doc: Document): WatchlistPageData => {
    const nextDataScript = doc.querySelector<HTMLScriptElement>("#__NEXT_DATA__");
    if (!nextDataScript) {
      throw new Error("IMDb page data (__NEXT_DATA__) is missing.");
    }

    let nextData: ImdbNextData;
    try {
      nextData = JSON.parse(nextDataScript.textContent || "") as ImdbNextData;
    } catch {
      throw new Error("IMDb page data (__NEXT_DATA__) is not valid JSON.");
    }

    const search = nextData.props?.pageProps?.mainColumnData?.predefinedList?.titleListItemSearch;
    if (
      !search ||
      !Array.isArray(search.edges) ||
      typeof search.total !== "number" ||
      !Number.isInteger(search.total)
    ) {
      throw new Error("IMDb watchlist data has an unexpected structure.");
    }

    const items = search.edges.map((edge) => constructMultimediaFromListItem(edge.listItem));
    if (items.some((item) => !item.titleId || !item.title)) {
      throw new Error("IMDb returned an incomplete title entry.");
    }

    return {
      items,
      total: search.total,
    };
  };

  const notify = (message: ScannerMessage): void => {
    void sendScannerMessage(message).catch(() => {
      // The popup may have been closed while the scan was running.
    });
  };

  try {
    console.info("[IMDb Randomizer] Watchlist scan started in detailed mode.");
    notify({ message: "scanning_has_started" });

    const multimedias: Multimedia[] = [];
    const seenPages = new Set<string>();
    let totalPages = 1;
    let expectedTotal = 0;

    for (let page = 1; page <= Math.min(totalPages, MAX_PAGES); page += 1) {
      const doc = await fetchPage(page);
      const pageData = extractPageData(doc);

      if (!pageData.items.length) {
        throw new Error(
          "IMDb returned no titles. Make sure the watchlist is visible and try again.",
        );
      }
      if (page === 1) {
        expectedTotal = pageData.total;
        totalPages = Math.ceil(expectedTotal / pageData.items.length);
        if (totalPages > MAX_PAGES) {
          throw new Error(`IMDb returned an unexpected page count: ${totalPages}.`);
        }
      }

      const pageFingerprint = pageData.items.map((item) => item.titleId).join(",");
      if (seenPages.has(pageFingerprint)) {
        throw new Error(`IMDb repeated page ${page}; scanning was stopped.`);
      }
      seenPages.add(pageFingerprint);
      multimedias.push(...pageData.items);

      console.info(
        `[IMDb Randomizer] Page ${page}/${totalPages}: ` +
          `${pageData.items.length} titles read (${multimedias.length} total).`,
      );

      notify({
        message: "scanning_progress",
        payload: {
          page,
          totalPages,
          titles: multimedias.length,
        },
      });
    }

    if (!multimedias.length) throw new Error("No watchlist titles could be read.");
    if (multimedias.length !== expectedTotal) {
      throw new Error(
        `IMDb reports ${expectedTotal} titles, but only ${multimedias.length} were read.`,
      );
    }

    await saveWatchlist(multimedias);
    console.info(`[IMDb Randomizer] Scan complete: ${multimedias.length} titles cached.`);
    notify({ message: "all_multimedia", payload: multimedias });
  } catch (error) {
    console.error("[IMDb Randomizer] Watchlist scan failed.", error);
    notify({
      message: "scanning_failed",
      payload: error instanceof Error ? error.message : String(error),
    });
  }
})();
