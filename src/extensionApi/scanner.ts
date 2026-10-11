import type { Multimedia, ScannerMessage } from "../types";

const watchlistStorageKey = "imdbRandomizer_watchlist";

export const saveWatchlist = (watchlist: Multimedia[]): Promise<void> =>
  chrome.storage.local.set({ [watchlistStorageKey]: watchlist });

export const sendScannerMessage = (message: ScannerMessage): Promise<unknown> =>
  chrome.runtime.sendMessage(message);
