import type { Multimedia, RandomizerOptions } from "../types";

type RandomizerFilters = Pick<RandomizerOptions, "minIMDBRating" | "multimediaType">;

export const multimediaMatchesFilters = (
  multimedia: Multimedia,
  filters: RandomizerFilters,
): boolean =>
  Number(multimedia.ratingIMDB) >= Number(filters.minIMDBRating) &&
  (filters.multimediaType === "all" || multimedia.multimediaType === filters.multimediaType);

export const pickRandomMultimedia = (
  multimedias: Multimedia[],
  filters: RandomizerFilters,
  random: () => number = Math.random,
): Multimedia | null => {
  const matches = multimedias.filter((multimedia) => multimediaMatchesFilters(multimedia, filters));

  if (!matches.length) return null;

  return matches[Math.floor(random() * matches.length)];
};
