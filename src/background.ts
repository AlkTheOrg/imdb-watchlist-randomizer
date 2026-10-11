import {
  getActiveTab,
  injectWatchlistScanner,
  onWatchlistScanRequested,
  reportScanningFailure,
  reportWatchlistValidation,
} from "./extensionApi/background";

const executeScannerOnTab = async (tabId: number): Promise<void> => {
  try {
    await injectWatchlistScanner(tabId);
  } catch (error) {
    console.error("[IMDb Randomizer] Could not start the watchlist scan.", error);
    void reportScanningFailure(error).catch(() => {
      // The popup may have been closed before the error was reported.
    });
  }
};

// If you have access to someone else's public watchlist, this will still return true.
const imdbWatchlistUrlRegex = (url: string): boolean => /.*imdb.com.*watchlist.*/.test(url);

const urlIsImdbWatchlistPage = (url?: string): boolean => {
  const itIsWatchlistPage = Boolean(url && imdbWatchlistUrlRegex(url));
  void reportWatchlistValidation(itIsWatchlistPage).catch(() => {
    // The popup may have been closed before validation completed.
  });
  return itIsWatchlistPage;
};

const scanActiveWatchlist = async (): Promise<void> => {
  const activeTab = await getActiveTab();
  if (activeTab?.id !== undefined && urlIsImdbWatchlistPage(activeTab.url)) {
    await executeScannerOnTab(activeTab.id);
  } else {
    console.warn("[IMDb Randomizer] Scan skipped: the active tab is not an IMDb watchlist.");
  }
};

onWatchlistScanRequested(() => {
  void scanActiveWatchlist().catch((error: unknown) => {
    console.error("[IMDb Randomizer] Could not inspect the active tab.", error);
    void reportScanningFailure(error).catch(() => {
      // The popup may have been closed before the error was reported.
    });
  });
});
