const executeScriptsOnTab = (tabId, files) => {
  return chrome.scripting
    .executeScript({
      target: { tabId: tabId },
      files,
    })
    .catch((err) => {
      console.error("[IMDb Randomizer] Could not start the watchlist scan.", err);
      chrome.runtime
        .sendMessage({
          message: "scanning_failed",
          payload: err.message || String(err),
        })
        .catch(() => {});
    });
};

// If you have access to someone else's public watchlist, this will still return true.
const imdbWatchlistUrlRegex = (url) => /.*imdb.com.*watchlist.*/.test(url);

const urlIsImdbWatchlistPage = (url) => {
  const itIsWatchlistPage = imdbWatchlistUrlRegex(url);
  chrome.runtime.sendMessage({
    message: "watchlist_url_validation",
    payload: itIsWatchlistPage,
  });
  return itIsWatchlistPage;
};

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.message && request.message === "scan_watchlist") {
    chrome.tabs.query(
      { currentWindow: true, active: true },
      function (tabArray) {
        const activeTab = tabArray[0];
        if (tabArray && activeTab && urlIsImdbWatchlistPage(activeTab.url)) {
          executeScriptsOnTab(activeTab.id, ["./getMultimedias.js"]);
        } else {
          console.warn(
            "[IMDb Randomizer] Scan skipped: the active tab is not an IMDb watchlist."
          );
        }
      }
    );
  }
});
