import { describe, expect, it } from "vitest";
import type { Multimedia } from "../types";
import { multimediaMatchesFilters, pickRandomMultimedia } from "./randomizer";

const multimedia = (
  titleId: string,
  ratingIMDB: string,
  multimediaType: Multimedia["multimediaType"],
): Multimedia => ({
  titleId,
  title: titleId,
  multimediaHref: "",
  imgSrc: "",
  year: "",
  runtime: "",
  genres: "",
  ratingIMDB,
  ratingMetac: "",
  plot: "",
  credits: [],
  multimediaType,
});

const titles = [
  multimedia("low-rated-movie", "5.9", "movie"),
  multimedia("matching-movie", "7.0", "movie"),
  multimedia("matching-series", "8.5", "series"),
];

describe("multimediaMatchesFilters", () => {
  it("includes a title at the minimum rating", () => {
    expect(
      multimediaMatchesFilters(titles[1], {
        minIMDBRating: "7",
        multimediaType: "movie",
      }),
    ).toBe(true);
  });

  it("rejects titles with the wrong type or a lower rating", () => {
    const filters = { minIMDBRating: "7", multimediaType: "movie" } as const;

    expect(multimediaMatchesFilters(titles[0], filters)).toBe(false);
    expect(multimediaMatchesFilters(titles[2], filters)).toBe(false);
  });
});

describe("pickRandomMultimedia", () => {
  it("returns null when no titles match", () => {
    expect(
      pickRandomMultimedia(titles, {
        minIMDBRating: "9",
        multimediaType: "all",
      }),
    ).toBeNull();
  });

  it("selects from the filtered titles using the supplied random value", () => {
    const result = pickRandomMultimedia(
      titles,
      { minIMDBRating: "7", multimediaType: "all" },
      () => 0.999,
    );

    expect(result?.titleId).toBe("matching-series");
  });
});
