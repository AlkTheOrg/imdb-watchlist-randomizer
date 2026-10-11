export const Navbar = () => (
  <nav className="navbar navbar-expand">
    <img
      src="./images/icon-128x128.png"
      alt="IMDb Watchlist Randomizer"
      className="navbar-logo m-0"
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
              className="github-logo"
              src="./images/GitHub-Mark-32px.png"
              alt="GitHub"
            />
          </a>
        </li>
      </ul>
    </div>
  </nav>
);
