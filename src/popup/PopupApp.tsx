export const PopupApp = () => (
  <nav className="navbar navbar-expand">
    <img
      src="./images/icon-128x128.png"
      width="44"
      height="32"
      alt="IMDb Watchlist Randomizer"
      className="m-0"
    />

    <div className="collapse navbar-collapse">
      <ul className="navbar-nav ml-auto">
        <li className="nav-item active">
          <a
            className="nav-link"
            target="_blank"
            href="https://github.com/AlkTheOrg/imdb-watchlist-randomizer/blob/main/ABOUT.md#about-the-extension"
          >
            About
          </a>
        </li>

        <li className="nav-item">
          <a
            id="githubHref"
            className="nav-link"
            href="https://github.com/AlkTheOrg/imdb-watchlist-randomizer"
            target="_blank"
          >
            <img
              width="24"
              src="./images/GitHub-Mark-32px.png"
              alt="GitHub"
            />
          </a>
        </li>
      </ul>
    </div>
  </nav>
);
