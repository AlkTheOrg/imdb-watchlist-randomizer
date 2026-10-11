import type { MultimediaFilter, RandomizerOptions } from "../types";

type OptionsFormProps = {
  canRandomize: boolean;
  isScanning: boolean;
  onChange: (options: RandomizerOptions) => void;
  onRandomize: () => void;
  onScan: () => void;
  options: RandomizerOptions;
};

const isMultimediaFilter = (value: string): value is MultimediaFilter =>
  value === "movie" || value === "series" || value === "all";

export const OptionsForm = ({
  canRandomize,
  isScanning,
  onChange,
  onRandomize,
  onScan,
  options,
}: OptionsFormProps) => {
  const updateOption = <Key extends keyof RandomizerOptions>(
    key: Key,
    value: RandomizerOptions[Key],
  ) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <form className="p-2 mt-2">
      <div className="form-row m-0">
        <div className="option-field col-md-6 mb-3 ml-auto mr-4">
          <label htmlFor="minIMDBRating">Min IMDB Rating:</label>
          <select
            className="form-control form-control-sm"
            id="minIMDBRating"
            value={options.minIMDBRating}
            onChange={(event) => updateOption("minIMDBRating", event.currentTarget.value)}
          >
            <option value="1">All</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
          </select>
        </div>

        <div className="option-field col-md-6 mb-3 mr-auto ml-4">
          <label htmlFor="multimediaType">Multimedia Type:</label>
          <select
            className="form-control form-control-sm"
            id="multimediaType"
            value={options.multimediaType}
            onChange={(event) => {
              const { value } = event.currentTarget;
              if (isMultimediaFilter(value)) {
                updateOption("multimediaType", value);
              }
            }}
          >
            <option value="movie">Movies Only</option>
            <option value="series">TV Series Only</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <div className="d-flex justify-content-around">
        <CheckboxOption
          checked={options.showRatings}
          id="showRatings"
          label="Ratings"
          onChange={(checked) => updateOption("showRatings", checked)}
        />
        <CheckboxOption
          checked={options.showPoster}
          id="showPoster"
          label="Poster"
          onChange={(checked) => updateOption("showPoster", checked)}
        />
        <CheckboxOption
          checked={options.showPlot}
          id="showPlot"
          label="Plot"
          onChange={(checked) => updateOption("showPlot", checked)}
        />
        <CheckboxOption
          checked={options.showGenres}
          hidden
          id="showGenres"
          label="Genres"
          onChange={(checked) => updateOption("showGenres", checked)}
        />
        <CheckboxOption
          checked={options.showCredits}
          id="showCredits"
          label="Credits"
          onChange={(checked) => updateOption("showCredits", checked)}
        />
      </div>

      <div className="container text-center">
        <fieldset className="btn-group randomize-btns">
          <legend className="sr-only">Randomization actions</legend>
          <button
            type="button"
            disabled={isScanning}
            className="btn btn-outline-danger btn-sm"
            onClick={onScan}
          >
            SCAN & RANDOMIZE
          </button>
          <button
            disabled={!canRandomize}
            type="button"
            className="randomize-from-cache btn text-white btn-sm ml-2 cool-orange"
            onClick={onRandomize}
          >
            RANDOMIZE
          </button>
        </fieldset>
      </div>
    </form>
  );
};

type CheckboxOptionProps = {
  checked: boolean;
  hidden?: boolean;
  id: string;
  label: string;
  onChange: (checked: boolean) => void;
};

const CheckboxOption = ({ checked, hidden = false, id, label, onChange }: CheckboxOptionProps) => (
  <div className={`form-check form-check-inline${hidden ? " d-none" : ""}`}>
    <input
      checked={checked}
      className="form-check-input"
      type="checkbox"
      id={id}
      onChange={(event) => onChange(event.currentTarget.checked)}
    />
    <label className="form-check-label" htmlFor={id}>
      {label}
    </label>
  </div>
);
