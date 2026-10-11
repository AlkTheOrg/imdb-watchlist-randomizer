import type { ExtensionMessage, Multimedia, RandomizerOptions } from "../types";

const storageKeys = {
  lastRandom: "imdbRandomizer_lastRandom",
  options: "imdbRandomizer_options",
  watchlist: "imdbRandomizer_watchlist",
} as const;

export type PopupState = {
  lastRandom?: Multimedia;
  options?: RandomizerOptions;
  watchlist?: Multimedia[];
};

export const loadPopupState = async (): Promise<PopupState> => {
  const [syncedStorage, localStorage] = await Promise.all([
    chrome.storage.sync.get([storageKeys.options, storageKeys.lastRandom]),
    chrome.storage.local.get(storageKeys.watchlist),
  ]);

  return {
    options: syncedStorage[storageKeys.options] as RandomizerOptions | undefined,
    lastRandom: syncedStorage[storageKeys.lastRandom] as Multimedia | undefined,
    watchlist: localStorage[storageKeys.watchlist] as Multimedia[] | undefined,
  };
};

export const saveOptions = (options: RandomizerOptions): Promise<void> =>
  chrome.storage.sync.set({ [storageKeys.options]: options });

export const saveLastRandom = (multimedia: Multimedia): Promise<void> =>
  chrome.storage.sync.set({ [storageKeys.lastRandom]: multimedia });

export const requestWatchlistScan = (): Promise<unknown> =>
  chrome.runtime.sendMessage({ message: "scan_watchlist" } satisfies ExtensionMessage);

export const onExtensionMessage = (listener: (message: ExtensionMessage) => void): (() => void) => {
  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
};
