import type {
  ExtensionMessage,
  Multimedia,
  MultimediaFilter,
  RandomizerOptions,
} from "./types";

type MessageOf<Type extends ExtensionMessage["message"]> = Extract<
  ExtensionMessage,
  { message: Type }
>;

const defaultOptions: RandomizerOptions = {
  minIMDBRating: "1",
  multimediaType: "movie",
  showCredits: true,
  showGenres: false,
  showPoster: true,
  showRatings: true,
  showPlot: true,
};

let loadOptions: RandomizerOptions = defaultOptions;
let randomizeFromCacheListener: (() => void) | null = null;

const getElementById = <ElementType extends HTMLElement>(
  id: string
): ElementType => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Required popup element #${id} is missing.`);
  return element as ElementType;
};

// Updates the status area used for errors and scan progress.
const updateinfoOutputDivMsg = (msg: string, color = ""): void => {
  const output = getElementById<HTMLDivElement>("infoOutputDiv");
  output.textContent = msg;
  output.style.color = color;
  output.classList.add("mb-2");
};

/* ******************************************
GENERATING RANDOMLY SELECTED MULTIMEDIA'S DIV
****************************************** */

const addClassesToHTMLElem = (element: Element, classes: string): void => {
  element.classList.add(...classes.split(" "));
};

const createTitleElem = (multimedia: Multimedia): HTMLAnchorElement => {
  const title = document.createElement("a");
  title.href = multimedia.multimediaHref;
  title.textContent = multimedia.title;
  title.target = "_blank";
  addClassesToHTMLElem(title, "title");
  return title;
};

const createYearElem = (year: string): HTMLParagraphElement => {
  const yearElement = document.createElement("p");
  yearElement.textContent = year;
  addClassesToHTMLElem(yearElement, "year mb-2");
  return yearElement;
};

const createIMDBRatingElem = (rating: string): HTMLLIElement => {
  const ratingElement = document.createElement("li");
  addClassesToHTMLElem(ratingElement, "rating");
  ratingElement.innerHTML = `<span class="star"></span>${rating}`;
  return ratingElement;
};

const createMetascoreElem = (score: string): HTMLLIElement => {
  const scoreElement = document.createElement("li");
  scoreElement.textContent = score;
  const numericScore = Number(score);
  const scoreClass =
    numericScore > 60
      ? "metacritic-favorable"
      : numericScore > 39
        ? "metacritic-average"
        : "metacritic-unfavorable";
  addClassesToHTMLElem(
    scoreElement,
    `mx-auto rating metacritic ${scoreClass}`
  );
  return scoreElement;
};

const createRatingsElem = (multimedia: Multimedia): HTMLUListElement => {
  const ratings = document.createElement("ul");
  addClassesToHTMLElem(ratings, "ratings");
  ratings.appendChild(createIMDBRatingElem(multimedia.ratingIMDB));
  ratings.appendChild(createMetascoreElem(multimedia.ratingMetac));
  return ratings;
};

const createPosterElem = (src: string): HTMLImageElement => {
  const poster = document.createElement("img");
  poster.alt = "poster";
  poster.src = src.startsWith("http") ? src : "./images/fbackImg.png";
  addClassesToHTMLElem(poster, "poster");
  return poster;
};

const createRuntimeElem = (runtime: string): HTMLParagraphElement => {
  const runtimeElement = document.createElement("p");
  addClassesToHTMLElem(runtimeElement, "runtime");
  runtimeElement.textContent = runtime;
  return runtimeElement;
};

const createHeroicContent = (
  multimedia: Multimedia,
  showPoster = true,
  showRatings = true
): HTMLDivElement => {
  const heroicContent = document.createElement("div");
  addClassesToHTMLElem(heroicContent, "mb-3 heroic-content");
  if (showRatings) heroicContent.appendChild(createRatingsElem(multimedia));
  if (showPoster) heroicContent.appendChild(createPosterElem(multimedia.imgSrc));
  heroicContent.appendChild(createRuntimeElem(multimedia.runtime));
  return heroicContent;
};

const createGenresElem = (genres: string[]): HTMLUListElement => {
  const genresList = document.createElement("ul");
  addClassesToHTMLElem(genresList, "genres list-inline");
  genres.forEach((genre) => {
    const genreListItem = document.createElement("li");
    genreListItem.textContent = genre;
    addClassesToHTMLElem(genreListItem, "genre list-inline-item");
    genresList.appendChild(genreListItem);
  });
  return genresList;
};

const createPlotElem = (plot: string): HTMLUListElement => {
  const plotElement = document.createElement("ul");
  plotElement.textContent = plot;
  addClassesToHTMLElem(plotElement, "mb-2 plot list-inline");
  return plotElement;
};

const createCreditsElem = (credits: string[]): HTMLUListElement => {
  const creditsList = document.createElement("ul");
  addClassesToHTMLElem(creditsList, "credits list-inline m-0");
  credits.forEach((credit) => {
    const creditListItem = document.createElement("li");
    creditListItem.textContent = credit;
    addClassesToHTMLElem(creditListItem, "credit list-inline-item");
    creditsList.appendChild(creditListItem);
  });
  return creditsList;
};

const createDivFromMultimedia = (multimedia: Multimedia): HTMLDivElement => {
  const result = document.createElement("div");
  addClassesToHTMLElem(
    result,
    "randomized-mmedia w-75 text-center mx-auto p-2 pb-3"
  );
  const { showCredits, showPoster, showRatings, showPlot } = loadOptions;

  result.appendChild(createTitleElem(multimedia));
  result.appendChild(createYearElem(multimedia.year));
  result.appendChild(createHeroicContent(multimedia, showPoster, showRatings));
  if (showPlot) result.appendChild(createPlotElem(multimedia.plot));
  // Genres are not currently returned by the IMDb scanner.
  // if (loadOptions.showGenres) {
  //   result.appendChild(createGenresElem(multimedia.genres.split(", ")));
  // }
  if (showCredits) result.appendChild(createCreditsElem(multimedia.credits));

  return result;
};

/* ******************************************
SAVE/LOAD OPTIONS TO/FROM CHROME SYNC
****************************************** */

const updateFormOptionsOnDom = (options: RandomizerOptions): void => {
  getElementById<HTMLInputElement>("showRatings").checked = options.showRatings;
  getElementById<HTMLInputElement>("showPoster").checked = options.showPoster;
  getElementById<HTMLInputElement>("showPlot").checked = options.showPlot;
  getElementById<HTMLInputElement>("showGenres").checked = options.showGenres;
  getElementById<HTMLInputElement>("showCredits").checked = options.showCredits;
  getElementById<HTMLSelectElement>("minIMDBRating").value =
    options.minIMDBRating;
  getElementById<HTMLSelectElement>("multimediaType").value =
    options.multimediaType;
};

const loadSyncedOptions = async (): Promise<void> => {
  const result = await chrome.storage.sync.get("imdbRandomizer_options");
  const syncedOptions = result.imdbRandomizer_options as
    | RandomizerOptions
    | undefined;
  loadOptions = syncedOptions ?? defaultOptions;
  updateFormOptionsOnDom(loadOptions);
};

const isMultimediaFilter = (value: string): value is MultimediaFilter =>
  value === "movie" || value === "series" || value === "all";

const constructOptionsFromForm = (): RandomizerOptions => {
  const multimediaTypeValue =
    getElementById<HTMLSelectElement>("multimediaType").value;
  const multimediaType = isMultimediaFilter(multimediaTypeValue)
    ? multimediaTypeValue
    : defaultOptions.multimediaType;

  return {
    showRatings: getElementById<HTMLInputElement>("showRatings").checked,
    showPoster: getElementById<HTMLInputElement>("showPoster").checked,
    showPlot: getElementById<HTMLInputElement>("showPlot").checked,
    showGenres: getElementById<HTMLInputElement>("showGenres").checked,
    showCredits: getElementById<HTMLInputElement>("showCredits").checked,
    minIMDBRating:
      getElementById<HTMLSelectElement>("minIMDBRating").value,
    multimediaType,
  };
};

const saveOptionsToSync = (): void => {
  const options = constructOptionsFromForm();
  void chrome.storage.sync
    .set({ imdbRandomizer_options: options })
    .then(() => {
      loadOptions = options;
    })
    .catch((error: unknown) => {
      console.error("[IMDb Randomizer] Could not save options.", error);
    });
};

const inputIds = [
  "showRatings",
  "showPoster",
  "showGenres",
  "showPlot",
  "showCredits",
  "minIMDBRating",
  "multimediaType",
] as const;

inputIds.forEach((id) => {
  getElementById<HTMLInputElement | HTMLSelectElement>(id).addEventListener(
    "change",
    saveOptionsToSync
  );
});

/* ******************************************
SAVE/LOAD LAST RANDOMLY CHOSEN MMEDIA TO/FROM CHROME SYNC
****************************************** */

const saveLastRandToSync = (multimedia: Multimedia): void => {
  void chrome.storage.sync.set({ imdbRandomizer_lastRandom: multimedia });
};

const loadLastRand = async (): Promise<void> => {
  const result = await chrome.storage.sync.get("imdbRandomizer_lastRandom");
  const lastRandom = result.imdbRandomizer_lastRandom as Multimedia | undefined;
  if (lastRandom) {
    getElementById<HTMLDivElement>("results").appendChild(
      createDivFromMultimedia(lastRandom)
    );
  }
};

/* ******************************************
SAVE/LOAD WATCHLIST TO/FROM LOCAL STORAGE
****************************************** */

const saveWatchlistToLocal = (multimedias: Multimedia[]): void => {
  void chrome.storage.local.set({ imdbRandomizer_watchlist: multimedias });
};

const loadWatchlistFromLocal = async (
  randomizeFromCacheButton: HTMLButtonElement,
  listenerCallback: (multimedias: Multimedia[]) => void
): Promise<Multimedia[] | null> => {
  const result = await chrome.storage.local.get("imdbRandomizer_watchlist");
  const multimedias = result.imdbRandomizer_watchlist as
    | Multimedia[]
    | undefined;

  if (randomizeFromCacheListener) {
    randomizeFromCacheButton.removeEventListener(
      "click",
      randomizeFromCacheListener
    );
    randomizeFromCacheListener = null;
  }

  if (!multimedias) {
    randomizeFromCacheButton.disabled = true;
    return null;
  }

  randomizeFromCacheButton.disabled = false;
  randomizeFromCacheListener = () => listenerCallback(multimedias);
  randomizeFromCacheButton.addEventListener(
    "click",
    randomizeFromCacheListener
  );
  return multimedias;
};

/* ******************************************
RANDOMLY SELECTING THE MULTIMEDIA
****************************************** */

const getRandomInt = (min: number, max: number): number => {
  const roundedMin = Math.ceil(min);
  const roundedMax = Math.floor(max);
  return (
    Math.floor(Math.random() * (roundedMax - roundedMin + 1)) + roundedMin
  );
};

const selectRandomMultimedia = (multimedias: Multimedia[]): Multimedia => {
  const randomIndex = getRandomInt(0, multimedias.length - 1);
  return multimedias[randomIndex];
};

const showRandomMultimedia = (multimedias: Multimedia[]): Multimedia => {
  const multimedia = selectRandomMultimedia(multimedias);
  const multimediaDiv = createDivFromMultimedia(multimedia);
  getElementById<HTMLDivElement>("results").prepend(multimediaDiv);
  return multimedia;
};

/* ******************************************
                    MAIN
****************************************** */

const multimediaIsATarget = (
  multimedia: Multimedia,
  minRating: string,
  multimediaType: MultimediaFilter
): boolean =>
  Number(multimedia.ratingIMDB) >= Number(minRating) &&
  (multimediaType === "all" || multimedia.multimediaType === multimediaType);

const filterMultimedias = (multimedias: Multimedia[]): Multimedia[] =>
  multimedias.filter((multimedia) =>
    multimediaIsATarget(
      multimedia,
      loadOptions.minIMDBRating,
      loadOptions.multimediaType
    )
  );

const main = (multimedias: Multimedia[]): void => {
  const filteredMultimedias = filterMultimedias(multimedias);

  if (filteredMultimedias.length) {
    const randomMultimedia = showRandomMultimedia(filteredMultimedias);
    saveLastRandToSync(randomMultimedia);
  } else {
    updateinfoOutputDivMsg(
      "No titles match the selected filters.",
      "rgb(255 0 0)"
    );
  }
};

/* ******************************************
              MESSAGE LISTENERS
****************************************** */

const loadWatchlist = async (): Promise<void> => {
  await loadWatchlistFromLocal(
    getElementById<HTMLButtonElement>("randomizeFromSync"),
    main
  );
};

const parseMultimedias = (payload: string): Multimedia[] => {
  const value: unknown = JSON.parse(payload);
  if (!Array.isArray(value)) {
    throw new Error("The scanned watchlist payload is not an array.");
  }
  return value as Multimedia[];
};

const handleAllMultimediaRequest = (
  request: MessageOf<"all_multimedia">
): void => {
  const multimedias = parseMultimedias(request.payload);
  saveWatchlistToLocal(multimedias);
  void loadWatchlist();
  main(multimedias);
  console.info(
    `[IMDb Randomizer] Scan complete: ${multimedias.length} titles cached.`
  );
  updateinfoOutputDivMsg(
    "Scanning is done and the RANDOMIZE button is available.",
    "#FF4F00"
  );
  getElementById<HTMLButtonElement>("scanAndRandomize").disabled = false;
};

const handleWatchListValidRequest = (
  request: MessageOf<"watchlist_url_validation">
): void => {
  if (request.payload) {
    updateinfoOutputDivMsg("");
  } else {
    updateinfoOutputDivMsg(
      "This is not a watchlist page. If it is please report this as a bug.",
      "rgb(255 0 0)"
    );
  }
};

const handleScanningStartedRequest = (): void => {
  getElementById<HTMLButtonElement>("scanAndRandomize").disabled = true;
  console.info("[IMDb Randomizer] Watchlist scan started in detailed mode.");
  updateinfoOutputDivMsg("Scanning has started. Hold on there!", "#DC3545");
};

const handleScanningProgressRequest = (
  request: MessageOf<"scanning_progress">
): void => {
  const { page, totalPages, titles } = request.payload;
  console.info(
    `[IMDb Randomizer] Page ${page}/${totalPages}: ${titles} titles collected.`
  );
  updateinfoOutputDivMsg(
    `Scanning detailed page ${page} of ${totalPages} (${titles} titles found)...`,
    "#DC3545"
  );
};

const handleScanningFailedRequest = (
  request: MessageOf<"scanning_failed">
): void => {
  getElementById<HTMLButtonElement>("scanAndRandomize").disabled = false;
  console.error(`[IMDb Randomizer] Scan failed: ${request.payload}`);
  updateinfoOutputDivMsg(`Scanning failed: ${request.payload}`, "rgb(255 0 0)");
};

chrome.runtime.onMessage.addListener((request: ExtensionMessage) => {
  switch (request.message) {
    case "all_multimedia":
      handleAllMultimediaRequest(request);
      break;
    case "watchlist_url_validation":
      handleWatchListValidRequest(request);
      break;
    case "scanning_has_started":
      handleScanningStartedRequest();
      break;
    case "scanning_progress":
      handleScanningProgressRequest(request);
      break;
    case "scanning_failed":
      handleScanningFailedRequest(request);
      break;
    case "scan_watchlist":
      break;
  }
});

/* ******************************************
SENDING THE ORDER OF "SCAN AND RANDOMIZE"
****************************************** */

getElementById<HTMLButtonElement>("scanAndRandomize").addEventListener(
  "click",
  () => {
    const message: ExtensionMessage = { message: "scan_watchlist" };
    void chrome.runtime.sendMessage(message);
  }
);

/* ******************************************
CLEAR SYNC and LOCAL STORAGE (For debugging)
****************************************** */

const clearSyncAndLocal = (): void => {
  chrome.storage.sync.clear(() => {
    const error = chrome.runtime.lastError;
    if (error) {
      console.error("[IMDb Randomizer] Could not clear synced data.", error);
    }
  });
  chrome.storage.local.clear(() => {
    const error = chrome.runtime.lastError;
    if (error) {
      console.error("[IMDb Randomizer] Could not clear local data.", error);
    }
  });
};

void (async function initializePopup() {
  // clearSyncAndLocal();
  // createGenresElem is retained for when the scanner returns genres again.
  void createGenresElem;
  void clearSyncAndLocal;

  await loadSyncedOptions();
  await loadLastRand();
  await loadWatchlist();
})().catch((error: unknown) => {
  console.error("[IMDb Randomizer] Popup initialization failed.", error);
  updateinfoOutputDivMsg("The extension could not be initialized.", "rgb(255 0 0)");
});
