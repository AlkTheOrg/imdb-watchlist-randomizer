export type MultimediaType = "movie" | "series";

export type Multimedia = {
  titleId: string;
  title: string;
  multimediaHref: string;
  imgSrc: string;
  year: string;
  runtime: string;
  genres: string;
  ratingIMDB: string;
  ratingMetac: string;
  plot: string;
  credits: string[];
  multimediaType: MultimediaType;
};

export type MultimediaFilter = MultimediaType | "all";

export type RandomizerOptions = {
  minIMDBRating: string;
  multimediaType: MultimediaFilter;
  showCredits: boolean;
  showGenres: boolean;
  showPoster: boolean;
  showRatings: boolean;
  showPlot: boolean;
};

export type ExtensionMessage =
  | { message: "scan_watchlist" }
  | { message: "watchlist_url_validation"; payload: boolean }
  | { message: "scanning_has_started" }
  | {
      message: "scanning_progress";
      payload: { page: number; totalPages: number; titles: number };
    }
  | { message: "scanning_failed"; payload: string }
  | { message: "all_multimedia"; payload: string };

export type ScannerMessage = Exclude<
  ExtensionMessage,
  { message: "scan_watchlist" } | { message: "watchlist_url_validation" }
>;
