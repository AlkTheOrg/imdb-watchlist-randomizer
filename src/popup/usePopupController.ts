import { useCallback, useEffect, useRef, useState } from "react";
import type { ExtensionMessage, Multimedia, RandomizerOptions } from "../types";
import { pickRandomMultimedia } from "./randomizer";

export type PopupStatus =
  | { type: "idle" }
  | { type: "starting" }
  | {
      type: "scanning";
      progress?: {
        page: number;
        totalPages: number;
        titles: number;
      };
    }
  | { type: "success"; titles: number }
  | { type: "error"; message: string };

export type RandomizedResult = {
  id: number;
  multimedia: Multimedia;
  options: RandomizerOptions;
};

const defaultOptions: RandomizerOptions = {
  minIMDBRating: "1",
  multimediaType: "movie",
  showCredits: true,
  showGenres: false,
  showPoster: true,
  showRatings: true,
  showPlot: true,
};

const parseMultimedias = (payload: string): Multimedia[] => {
  const value: unknown = JSON.parse(payload);
  if (!Array.isArray(value)) {
    throw new Error("The scanned watchlist payload is not an array.");
  }
  return value as Multimedia[];
};

export const usePopupController = () => {
  const [options, setOptions] = useState<RandomizerOptions>(defaultOptions);
  const [watchlist, setWatchlist] = useState<Multimedia[] | null>(null);
  const [results, setResults] = useState<RandomizedResult[]>([]);
  const [status, setStatus] = useState<PopupStatus>({ type: "idle" });
  const nextResultId = useRef(0);

  const addResult = useCallback((multimedia: Multimedia, resultOptions: RandomizerOptions) => {
    setResults((currentResults) => [
      {
        id: nextResultId.current++,
        multimedia,
        options: resultOptions,
      },
      ...currentResults,
    ]);
  }, []);

  const randomize = useCallback(
    (multimedias: Multimedia[]) => {
      const multimedia = pickRandomMultimedia(multimedias, options);

      if (!multimedia) {
        setStatus({
          type: "error",
          message: "No titles match the selected filters.",
        });
        return;
      }

      addResult(multimedia, options);
      void chrome.storage.sync
        .set({ imdbRandomizer_lastRandom: multimedia })
        .catch((error: unknown) => {
          console.error("[IMDb Randomizer] Could not save the selected title.", error);
        });
    },
    [addResult, options],
  );

  const onOptionsChange = useCallback((nextOptions: RandomizerOptions) => {
    setOptions(nextOptions);
    void chrome.storage.sync
      .set({ imdbRandomizer_options: nextOptions })
      .catch((error: unknown) => {
        console.error("[IMDb Randomizer] Could not save options.", error);
      });
  }, []);

  const onScan = useCallback(() => {
    setStatus({ type: "starting" });
    const message: ExtensionMessage = { message: "scan_watchlist" };
    void chrome.runtime.sendMessage(message).catch((error: unknown) => {
      console.error("[IMDb Randomizer] Could not start the scan.", error);
      setStatus({
        type: "error",
        message: "The scan could not be started.",
      });
    });
  }, []);

  const onRandomize = useCallback(() => {
    if (watchlist) randomize(watchlist);
  }, [randomize, watchlist]);

  useEffect(() => {
    let isActive = true;

    const initializePopup = async () => {
      const [syncedStorage, localStorage] = await Promise.all([
        chrome.storage.sync.get(["imdbRandomizer_options", "imdbRandomizer_lastRandom"]),
        chrome.storage.local.get("imdbRandomizer_watchlist"),
      ]);

      if (!isActive) return;

      const loadedOptions =
        (syncedStorage.imdbRandomizer_options as RandomizerOptions | undefined) ?? defaultOptions;
      const lastRandom = syncedStorage.imdbRandomizer_lastRandom as Multimedia | undefined;
      const cachedWatchlist = localStorage.imdbRandomizer_watchlist as Multimedia[] | undefined;

      setOptions(loadedOptions);
      setWatchlist(cachedWatchlist ?? null);
      if (lastRandom) addResult(lastRandom, loadedOptions);
    };

    void initializePopup().catch((error: unknown) => {
      if (!isActive) return;
      console.error("[IMDb Randomizer] Popup initialization failed.", error);
      setStatus({
        type: "error",
        message: "The extension could not be initialized.",
      });
    });

    return () => {
      isActive = false;
    };
  }, [addResult]);

  useEffect(() => {
    const handleMessage = (request: ExtensionMessage) => {
      switch (request.message) {
        case "all_multimedia": {
          const multimedias = parseMultimedias(request.payload);
          setWatchlist(multimedias);
          void chrome.storage.local
            .set({ imdbRandomizer_watchlist: multimedias })
            .catch((error: unknown) => {
              console.error("[IMDb Randomizer] Could not cache the watchlist.", error);
            });
          randomize(multimedias);
          setStatus({
            type: "success",
            titles: multimedias.length,
          });
          console.info(`[IMDb Randomizer] Scan complete: ${multimedias.length} titles cached.`);
          break;
        }
        case "watchlist_url_validation":
          if (!request.payload) {
            setStatus({
              type: "error",
              message: "This is not a watchlist page. If it is please report this as a bug.",
            });
          }
          break;
        case "scanning_has_started":
          setStatus({ type: "scanning" });
          console.info("[IMDb Randomizer] Watchlist scan started in detailed mode.");
          break;
        case "scanning_progress": {
          const { page, totalPages, titles } = request.payload;
          setStatus({
            type: "scanning",
            progress: { page, totalPages, titles },
          });
          console.info(`[IMDb Randomizer] Page ${page}/${totalPages}: ${titles} titles collected.`);
          break;
        }
        case "scanning_failed":
          setStatus({
            type: "error",
            message: `Scanning failed: ${request.payload}`,
          });
          console.error(`[IMDb Randomizer] Scan failed: ${request.payload}`);
          break;
        case "scan_watchlist":
          break;
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [randomize]);

  return {
    canRandomize: watchlist !== null,
    onOptionsChange,
    onRandomize,
    onScan,
    options,
    results,
    status,
  };
};
