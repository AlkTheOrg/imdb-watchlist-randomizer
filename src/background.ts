import type { ExtensionMessage } from "./types";

const executeScriptsOnTab = async (
  tabId: number,
  files: string[]
): Promise<void> => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files,
    });
  } catch (error) {
    console.error(
      "[IMDb Randomizer] Could not start the watchlist scan.",
      error
    );
    const message: ExtensionMessage = {
      message: "scanning_failed",
      payload: error instanceof Error ? error.message : String(error),
    };
    void chrome.runtime.sendMessage(message).catch(() => {
      // The popup may have been closed before the error was reported.
    });
  }
};

// If you have access to someone else's public watchlist, this will still return true.
const imdbWatchlistUrlRegex = (url: string): boolean =>
  /.*imdb.com.*watchlist.*/.test(url);

const urlIsImdbWatchlistPage = (url?: string): boolean => {
  const itIsWatchlistPage = Boolean(url && imdbWatchlistUrlRegex(url));
  const message: ExtensionMessage = {
    message: "watchlist_url_validation",
    payload: itIsWatchlistPage,
  };
  void chrome.runtime.sendMessage(message).catch(() => {
    // The popup may have been closed before validation completed.
  });
  return itIsWatchlistPage;
};

chrome.runtime.onMessage.addListener((request: ExtensionMessage) => {
  if (request.message === "scan_watchlist") {
    chrome.tabs.query(
      { currentWindow: true, active: true },
      function (tabArray) {
        const activeTab = tabArray[0];
        if (
          activeTab?.id !== undefined &&
          urlIsImdbWatchlistPage(activeTab.url)
        ) {
          void executeScriptsOnTab(activeTab.id, ["./getMultimedias.js"]);
        } else {
          console.warn(
            "[IMDb Randomizer] Scan skipped: the active tab is not an IMDb watchlist."
          );
        }
      }
    );
  }
});
