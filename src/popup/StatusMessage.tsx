import type { PopupStatus } from "./usePopupController";

type StatusMessageProps = {
  status: PopupStatus;
};

const getStatusView = (
  status: PopupStatus,
): { message: string; tone: "default" | "error" | "progress" | "success" } => {
  switch (status.type) {
    case "idle":
      return { message: "", tone: "default" };
    case "starting":
      return { message: "Starting the watchlist scan...", tone: "progress" };
    case "scanning":
      return {
        message:
          status.progress === undefined
            ? "Scanning has started. Hold on there!"
            : `Scanning detailed page ${status.progress.page} of ${status.progress.totalPages} (${status.progress.titles} titles found)...`,
        tone: "progress",
      };
    case "success":
      return {
        message: `Scanning is done: ${status.titles} titles cached. The RANDOMIZE button is available.`,
        tone: "success",
      };
    case "error":
      return { message: status.message, tone: "error" };
  }
};

export const StatusMessage = ({ status }: StatusMessageProps) => {
  const { message, tone } = getStatusView(status);

  return (
    <div
      className={`status-message text-center px-2${message ? " mb-2" : ""} status-message--${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {message}
    </div>
  );
};
