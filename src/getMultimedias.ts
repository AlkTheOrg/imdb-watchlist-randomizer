import type { ScannerMessage } from "./types";
import { saveWatchlist, sendScannerMessage } from "./extensionApi/scanner";
import { scanWatchlist } from "./scanner/scanWatchlist";

const notify = (message: ScannerMessage): void => {
  void sendScannerMessage(message).catch(() => {
    // The popup may have been closed while the scan was running.
  });
};

void (async function () {
  try {
    console.info("[IMDb Randomizer] Watchlist scan started in detailed mode.");
    notify({ message: "scanning_has_started" });

    const multimedias = await scanWatchlist(
      window.location.href,
      ({ page, pageTitles, titles, totalPages }) => {
        console.info(
          `[IMDb Randomizer] Page ${page}/${totalPages}: ` +
            `${pageTitles} titles read (${titles} total).`,
        );

        notify({
          message: "scanning_progress",
          payload: { page, totalPages, titles },
        });
      },
    );

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
