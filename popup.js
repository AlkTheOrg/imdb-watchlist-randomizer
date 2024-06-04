let loadOptions;
const defaultOptions = {
  minIMDBRating: "1",
  multimediaType: "movie",
  showCredits: true,
  showGenres: false,
  showPoster: true,
  showRatings: true,
  showPlot: true,
};

// updates the div which I output some errors, state changes etc. to inform the user
const updateinfoOutputDivMsg = (msg, color) => {
  const errorMsgDiv = document.getElementById("infoOutputDiv");
  errorMsgDiv.textContent = msg;
  errorMsgDiv.style.color = color;
  errorMsgDiv.classList.add("mb-2");
};

/* ******************************************
GENERATING RANDOMLY SELECTED MULTIMEDIA'S DIV
****************************************** */

const addClassesToHTMLElem = (elem, classesString) => {
  elem.classList.add(...classesString.split(" "));
};

const createTitleElem = (mmedia) => {
  const titleHrefElem = document.createElement("a");
  titleHrefElem.href = mmedia.multimediaHref;
  titleHrefElem.textContent = mmedia.title;
  titleHrefElem.target = "_blank";
  addClassesToHTMLElem(titleHrefElem, "title");
  return titleHrefElem;
};

const createYearElem = (year) => {
  const yearElem = document.createElement("p");
  yearElem.textContent = year;
  addClassesToHTMLElem(yearElem, "year mb-2");
  return yearElem;
};

const createIMDBRatingElem = (rating) => {
  const ratingElem = document.createElement("li");
  addClassesToHTMLElem(ratingElem, "rating");
  ratingElem.innerHTML = '<span class="star"></span>' + rating;
  return ratingElem;
};

const createMetascoreElem = (score) => {
  const scoreElem = document.createElement("li");
  scoreElem.textContent = score;
  const scoreClass =
    +score > 60
      ? "metacritic-favorable"
      : +score > 39
      ? "metacritic-average"
      : "metacritic-unfavorable";
  addClassesToHTMLElem(scoreElem, "mx-auto rating metacritic " + scoreClass);
  return scoreElem;
};

const createRatingsElem = (mmedia) => {
  const ratingsElem = document.createElement("ul");
  addClassesToHTMLElem(ratingsElem, "ratings");
  ratingsElem.appendChild(createIMDBRatingElem(mmedia.ratingIMDB));
  ratingsElem.appendChild(createMetascoreElem(mmedia.ratingMetac));
  return ratingsElem;
};

const createPosterElem = (src) => {
  const posterElem = document.createElement("img", { alt: "poster" });
  !src || src.slice(0, 4) !== "http"
    ? (posterElem.src = "./images/fbackImg.png")
    : (posterElem.src = src);
  addClassesToHTMLElem(posterElem, "poster");
  return posterElem;
};

const createRuntimeElem = (runtime) => {
  const runtimeELem = document.createElement("p");
  addClassesToHTMLElem(runtimeELem, "runtime");
  runtimeELem.textContent = runtime;
  return runtimeELem;
};

const createHeroicContent = (mmedia, showPoster = true, showRatings = true) => {
  const heroicDiv = document.createElement("div");
  addClassesToHTMLElem(heroicDiv, "mb-3 heroic-content");
  showRatings && heroicDiv.appendChild(createRatingsElem(mmedia));
  showPoster && heroicDiv.appendChild(createPosterElem(mmedia.imgSrc));
  heroicDiv.appendChild(createRuntimeElem(mmedia.runtime));
  return heroicDiv;
};

// genres: [Crime, Drama, Mystery]
const createGenresElem = (genres) => {
  const genresList = document.createElement("ul");
  addClassesToHTMLElem(genresList, "genres list-inline");
  genres.forEach((genre) => {
    const genreListItem = document.createElement("li");
    genreListItem.textContent = genre;
    addClassesToHTMLElem(genreListItem, "genre list-inline-item");
    genresList.appendChild(genreListItem);
  });
  return genresList;
};

const createPlotElem = (plot) => {
  const plotElem = document.createElement("ul");
  plotElem.textContent = plot;
  addClassesToHTMLElem(plotElem, "mb-2 plot list-inline");
  return plotElem;	
};

const createCreditsElem = (credits) => {
  const creditsList = document.createElement("ul");
  addClassesToHTMLElem(creditsList, "credits list-inline m-0");
  credits.forEach((credit) => {
    const creditListItem = document.createElement("li");
    creditListItem.textContent = credit;
    addClassesToHTMLElem(creditListItem, "credit list-inline-item");
    creditsList.appendChild(creditListItem);
  });
  return creditsList;
};

const createDivFromMultimedia = (mmedia) => {
  const div = document.createElement("div");
  addClassesToHTMLElem(div, "randomized-mmedia w-75 text-center mx-auto p-2 pb-3");
  const { showCredits, showGenres, showPoster, showRatings, showPlot } = loadOptions;

  div.appendChild(createTitleElem(mmedia));
  div.appendChild(createYearElem(mmedia.year));
  div.appendChild(createHeroicContent(mmedia, showPoster, showRatings));
  showPlot && div.appendChild(createPlotElem(mmedia.plot));
  // showGenres && div.appendChild(createGenresElem(mmedia.genres.split(", "))); // TODO remove from code as well
  showCredits && div.appendChild(createCreditsElem(mmedia.credits));

  return div;
};

/* ******************************************
SAVE/LOAD OPTIONS TO/FROM CHROME SYNC
****************************************** */
const updateFormOptionsOnDom = (options) => {
  console.log(options);
  Object.keys(options).forEach((key) => {
    const elem = document.getElementById(key);
    elem.tagName === "INPUT" && elem.type === "checkbox"
      ? (elem.checked = options[key])
      : (elem.value = options[key]);
  });
};

// if there are synced settings, assign them to global loadOptions variable
// if not assign defaultOptions to the same variable
// call the function that updates form dom
const loadSyncedOptions = async () => {
  await chrome.storage.sync.get("imdbRandomizer_options", (result) => {
    const options = result.imdbRandomizer_options;
    if (options) loadOptions = options;
    else {
      console.log("Couldnt find saved options on sync. Using the defaults");
      loadOptions = defaultOptions;
    }
    updateFormOptionsOnDom(loadOptions);
  });
};

const constructOptionsFromForm = () => {
  const showRatings = document.querySelector("#showRatings").checked;
  const showPoster = document.querySelector("#showPoster").checked;
  const showPlot = document.querySelector("#showPlot").checked;
  const showGenres = document.querySelector("#showGenres").checked;
  const showCredits = document.querySelector("#showCredits").checked;
  const minIMDBRating = document.querySelector("#minIMDBRating").value;
  const multimediaType = document.querySelector("#multimediaType").value;
  return {
    showRatings,
    showPoster,
    showPlot,
    showGenres,
    showCredits,
    minIMDBRating,
    multimediaType,
  };
};

const saveOptionsToSync = () => {
  const options = constructOptionsFromForm();
  chrome.storage.sync.set(
    {
      imdbRandomizer_options: options,
    },
    () => {
      console.log("saved");
      // updateinfoOutputDivMsg("Your randomize options are saved.", "#007bff");
      loadOptions = options;
    }
  );
};

inputIds = ['showRatings', 'showPoster', 'showGenres', 'showPlot', 'showCredits', 'minIMDBRating', 'multimediaType']
inputIds.forEach(id => {
  const inputWithId = document.querySelector(`#${id}`);
  inputWithId.addEventListener('change', saveOptionsToSync)
})

// document
//   .querySelector("#save-options")
//   .addEventListener("click", saveOptionsToSync);

/* ******************************************
SAVE/LOAD LAST RANDOMLY CHOSEN MMEDIA TO/FROM CHROME SYNC
****************************************** */
const saveLastRandToSync = (randMmedia) => {
  console.log(randMmedia);
  chrome.storage.sync.set(
    {
      imdbRandomizer_lastRandom: randMmedia,
    },
    () => {
      console.log("lastRandom saved");
    }
  );
};

const loadLastRand = async () => {
  console.log("loading last rand");
  await chrome.storage.sync.get("imdbRandomizer_lastRandom", (result) => {
    const lastRand = result.imdbRandomizer_lastRandom;
    if (lastRand) {
      const div = createDivFromMultimedia(lastRand);
      document.querySelector("#results").appendChild(div);
    } else {
      console.log("No last rand mmedia");
    }
  });
};

/* ******************************************
SAVE/LOAD WATCHLIST TO/FROM LOCAL STORAGE
****************************************** */
const saveWatchlistToLocal = (multimedias) => {
  chrome.storage.local.set(
    {
      imdbRandomizer_watchlist: multimedias,
    },
    () => {
      console.log("watchlist is saved");
    }
  );
};

const loadWatchlistFromLocal = (randomizeFromCacheBtn, listenerCBack) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("imdbRandomizer_watchlist", (result) => {
      const multimedias = result.imdbRandomizer_watchlist;
      if (multimedias) {
        randomizeFromCacheBtn.disabled = false;
        randomizeFromCacheBtn.addEventListener("click", () =>
          listenerCBack(multimedias)
        );
        resolve(multimedias);
      } else {
        console.log("No cached watchlist");
        randomizeFromCacheBtn.disabled = true;
        randomizeFromCacheBtn.removeEventListener("click", () =>
          listenerCBack(multimedias)
        );
        resolve(null);
      }
    });
  });
};

/* ******************************************
RANDOMLY SELECTING THE MULTIMEDIA
****************************************** */

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const selectRandomMultimedia = (mmedias) => {
  const randInt = getRandomInt(0, mmedias.length - 1);
  return mmedias[randInt];
};

const showRandomMultimedia = (mmedias) => {
  const mmedia = selectRandomMultimedia(mmedias);
  const mmediaDiv = createDivFromMultimedia(mmedia);
  document.querySelector("#results").prepend(mmediaDiv);
  return mmedia;
};

/* ******************************************
                    MAIN
****************************************** */
const multimediaIsATarget = (mmedia, minRating, mmType) => {
  return (
    +mmedia.ratingIMDB >= +minRating &&
    (mmType === "all" || mmedia.multimediaType === mmType)
  );
};

const filterMultimedias = (multimedias) => {
  const result = loadOptions
    ? multimedias.filter((mmedia) =>
        multimediaIsATarget(
          mmedia,
          loadOptions.minIMDBRating,
          loadOptions.multimediaType
        )
      )
    : multimedias;
  return result;
};

const main = (multimedias) => {
  const filteredMultimedias = filterMultimedias(multimedias);
  console.log(filteredMultimedias);

  if (filteredMultimedias.length >= 1) {
    const randMmedia = showRandomMultimedia(filteredMultimedias);
    saveLastRandToSync(randMmedia);
  } else console.log("Nothing to choose"); //TODO
};

/* ******************************************
              MESSAGE LISTENERS
****************************************** */
const loadWatchlist = async () => {
  await loadWatchlistFromLocal(
    document.querySelector("#randomizeFromSync"),
    (multimedias) => main(multimedias)
  );
};

/* WAITING THE MULTIMEDIA THAT IS PARSED FROM WATCHLIST PAGE
this listener asserts that the current page is an imdb watchlist
the validation of this made in background.js before sanding this message to popup.js */
const handleAllMultimediaRequest = (request) => {
  const multimedias = JSON.parse(request.payload);
  saveWatchlistToLocal(multimedias);
  loadWatchlist(); // using it to update dom. gotta refactor this project lol
  console.log("loadOptions:", loadOptions);
  main(multimedias);
  updateinfoOutputDivMsg(
    "Scanning is done and the RANDOMIZE button is available.",
    "#FF4F00"
  );
};

//LISTENING FOR THE VALIDATION OF THE WATCHLIST PAGE URL
//If not a valid page, it will notify the user.
const handleWatchListValidRequest = (request) => {
  const itIsWatchlistPage = request.payload;
  if (itIsWatchlistPage) updateinfoOutputDivMsg("");
  else
    updateinfoOutputDivMsg(
      "This is not a watchlist page. If it is please report this as a bug.",
      "rgb(255 0 0)"
    );
};

const handleScanningStartedRequest = (request) => {
  updateinfoOutputDivMsg("Scanning has started. Hold on there!", "#DC3545");
};

chrome.runtime.onMessage.addListener((request, sender) => {
  console.log(request);
  const msg = request.message;
  if (msg) {
    if (msg === "all_multimedia") handleAllMultimediaRequest(request);
    else if (msg === "watchlist_url_validation")
      handleWatchListValidRequest(request);
    else if (msg === "scanning_has_started")
      handleScanningStartedRequest(request);
    else throw new Error("Invalid message");
  }
});

/* ******************************************
SENDING THE ORDER OF "SCAN AND RANDOMIZE"
****************************************** */
document.getElementById("scanAndRandomize").addEventListener("click", () => {
  chrome.runtime.sendMessage({
    message: "scan_watchlist",
  });
});

/* ******************************************
CLEAR SYNC and LOCALSTORAGE (For debugging)
****************************************** */
const clearSyncAndLocal = () => {
  // thanks to xOxxOm for the code: https://stackoverflow.com/a/31813035/13184911
  chrome.storage.sync.clear(function () {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    }
  });
  chrome.storage.local.clear(function () {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    }
  });
};
// might assign to a btn that will also call window.close() to reset the dom easily

(async function () {
  // clearSyncAndLocal();

  loadSyncedOptions();
  loadLastRand();
  await loadWatchlist();
})();
