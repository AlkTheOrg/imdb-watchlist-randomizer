import type { Multimedia, RandomizerOptions } from "../types";
import type { RandomizedResult } from "./usePopupController";

type MultimediaResultProps = {
  result: RandomizedResult;
};

const getMetascoreClass = (score: string): string => {
  const numericScore = Number(score);
  if (numericScore > 60) return "metacritic-favorable";
  if (numericScore > 39) return "metacritic-average";
  return "metacritic-unfavorable";
};

const Ratings = ({ multimedia }: { multimedia: Multimedia }) => (
  <ul className="ratings">
    <li className="rating">
      <span className="star" />
      {multimedia.ratingIMDB}
    </li>
    <li className={`mx-auto rating metacritic ${getMetascoreClass(multimedia.ratingMetac)}`}>
      {multimedia.ratingMetac}
    </li>
  </ul>
);

const HeroicContent = ({
  multimedia,
  options,
}: {
  multimedia: Multimedia;
  options: RandomizerOptions;
}) => (
  <div className="mb-3 heroic-content">
    {options.showRatings && <Ratings multimedia={multimedia} />}
    {options.showPoster && (
      <img
        className="poster"
        src={multimedia.imgSrc.startsWith("http") ? multimedia.imgSrc : "./images/fbackImg.png"}
        alt={`${multimedia.title} poster`}
      />
    )}
    <p className="runtime">{multimedia.runtime}</p>
  </div>
);

export const MultimediaResult = ({ result }: MultimediaResultProps) => {
  const { multimedia, options } = result;

  return (
    <article className="randomized-mmedia w-75 text-center mx-auto p-2 pb-3">
      <a className="title" href={multimedia.multimediaHref} target="_blank">
        {multimedia.title}
      </a>
      <p className="year mb-2">{multimedia.year}</p>
      <HeroicContent multimedia={multimedia} options={options} />

      {options.showPlot && <p className="mb-2 plot">{multimedia.plot}</p>}

      {options.showCredits && (
        <ul className="credits list-inline m-0">
          {multimedia.credits.map((credit, index) => (
            <li className="credit list-inline-item" key={`${credit}-${index}`}>
              {credit}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};
