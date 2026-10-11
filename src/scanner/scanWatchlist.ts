import type { Multimedia } from "../types";
import { fetchWatchlistPage } from "./imdbPage";

const MAX_PAGES = 100;

export type WatchlistScanProgress = {
  page: number;
  pageTitles: number;
  titles: number;
  totalPages: number;
};

export const scanWatchlist = async (
  currentUrl: string,
  onProgress: (progress: WatchlistScanProgress) => void,
): Promise<Multimedia[]> => {
  const multimedias: Multimedia[] = [];
  const seenPages = new Set<string>();
  let totalPages = 1;
  let expectedTotal = 0;

  for (let page = 1; page <= Math.min(totalPages, MAX_PAGES); page += 1) {
    const pageData = await fetchWatchlistPage(currentUrl, page);

    if (!pageData.items.length) {
      throw new Error("IMDb returned no titles. Make sure the watchlist is visible and try again.");
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

    onProgress({
      page,
      pageTitles: pageData.items.length,
      titles: multimedias.length,
      totalPages,
    });
  }

  if (!multimedias.length) throw new Error("No watchlist titles could be read.");
  if (multimedias.length !== expectedTotal) {
    throw new Error(
      `IMDb reports ${expectedTotal} titles, but only ${multimedias.length} were read.`,
    );
  }

  return multimedias;
};
