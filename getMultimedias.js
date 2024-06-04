(function () {
  console.log("get multimedias running");

  const getTextContentIfExists = (div, query) => {
    const element = div.querySelector(query);
    return element ? element.textContent : "";
  };

  const constructMultimediasFromDivs = (multimediaDivs) => {
    return Array.from(multimediaDivs).map((div) => {
      const titleTypeSpan = div.querySelector('span.dli-title-type-data');
      const multimediaType = titleTypeSpan && titleTypeSpan.textContent === 'TV Series'
        ? "series"
        : "movie";

      const posterContainer = div.querySelector('.ipc-poster');
      const imgHrefElem = posterContainer.querySelector('img');
      const imgSrc = imgHrefElem.src;
      
      const multimediaHref = div.querySelector('.ipc-lockup-overlay.ipc-focusable').href;

      const title = div.querySelector(".ipc-title__text").textContent.split('.')[1].trim();

      const [yearElement, runtimeElement] = div.querySelectorAll('.dli-title-metadata-item');

      const year = yearElement.textContent.trim();
      const runtime = runtimeElement ? runtimeElement.textContent.trim():"";

      // const genres = getTextContentIfExists(div, ".genre");
      const ratingIMDB = div.querySelector('[data-testid="ratingGroup--imdb-rating"]').textContent.replace(/\u00A0/g, ' ').split(' ')[0];
      const ratingMetac = getTextContentIfExists(div, ".metacritic-score-box");
	  
      const plot = div.querySelector('.ipc-html-content-inner-div').textContent;
      const creditsElem = div.querySelector(".dli-plot-container").nextElementSibling;
      const credits = creditsElem
        ? Array.from(creditsElem.children)
            // .filter((elem) => elem.tagName !== "SPAN") // TODO split based on director and stars span
            .map((elem) => elem.textContent)
        : [];

      return {
        title,
        multimediaHref,
        imgSrc,
        year,
        runtime,
        genres: "", // TODO: Cut support for this as IMDB no longer displays genre content
        ratingIMDB,
        ratingMetac,
	plot,
        credits,
        multimediaType,
      };
    });
  };

  const clearLoadMore = async () => {
    // gets all of the multimedia divs
    const multimediaDivs = document.querySelectorAll(".ipc-metadata-list-summary-item");

    // sends the constructor multimedia objects
    const multimedias = constructMultimediasFromDivs(multimediaDivs);
    console.log(multimedias);
    
    chrome.runtime.sendMessage({
      message: "all_multimedia",
      payload: JSON.stringify(multimedias),
    });
  };
  
  const numOfTitlesElem = document.querySelector('[data-testid="list-page-mc-total-items"]');
  const numOfTitles = numOfTitlesElem.textContent.split(' ')[0];

  const loadMore = () => {
	// const scrollAmount = document.documentElement.scrollHeight - document.documentElement.clientHeight;	
    const allTitles = document.querySelectorAll(".ipc-metadata-list-summary-item");
    const targetElement = allTitles[allTitles.length - 1];
    const targetElementTop = targetElement.getBoundingClientRect().top;
	
    const scrollAmount = 212 * 25; // each element's height is close to 212px and to make sure we load all the images we scroll 25 elements by 25
    const nextScrollPosition = document.documentElement.scrollTop + scrollAmount;

    if (nextScrollPosition >= targetElementTop)
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else
      document.documentElement.scrollTop += scrollAmount;

    if (targetElement && targetElement.textContent.trim().startsWith(numOfTitles) && isInView(targetElement)) {
      clearLoadMore();
    } else {
      setTimeout(loadMore, 500);
    }
  };

  chrome.runtime.sendMessage({
    message: "scanning_has_started",
  });
  
  loadMore();
})();

function isInView(element) {
  const rect = element.getBoundingClientRect();
  const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
  const windowWidth = (window.innerWidth || document.documentElement.clientWidth);

  const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
  const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

  return (vertInView && horInView);
}
