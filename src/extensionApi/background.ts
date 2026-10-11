import type { ExtensionMessage } from "../types";

export const getActiveTab = async (): Promise<chrome.tabs.Tab | undefined> => {
  const tabs = await chrome.tabs.query({ currentWindow: true, active: true });
  return tabs[0];
};

export const injectWatchlistScanner = async (tabId: number): Promise<void> => {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["./getMultimedias.js"],
  });
};

export const onWatchlistScanRequested = (listener: () => void): void => {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
    if (message.message === "scan_watchlist") listener();
  });
};

export const reportWatchlistValidation = (isWatchlist: boolean): Promise<unknown> =>
  chrome.runtime.sendMessage({
    message: "watchlist_url_validation",
    payload: isWatchlist,
  } satisfies ExtensionMessage);

export const reportScanningFailure = (error: unknown): Promise<unknown> =>
  chrome.runtime.sendMessage({
    message: "scanning_failed",
    payload: error instanceof Error ? error.message : String(error),
  } satisfies ExtensionMessage);
