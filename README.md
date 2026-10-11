# IMDB Watchlist Randomizer

<div align="left">
    <p><a href="https://chrome.google.com/webstore/detail/imdb-watchlist-randomizer/elbfbpalmljkclkphdjmbloancjnehea"><img alt="IWR at ChomeStore" align="center" src="https://img.shields.io/badge/Chrome Web Store-%234285F4.svg?&style=for-the-badge&logo=google-chrome&logoColor=white" /></a>&nbsp; View App on the Chrome Store</p>
</div>

A Chrome extension for filtering an IMDb watchlist and selecting a random movie, TV series, or other title.

The extension currently targets Chrome using Manifest V3. Firefox support is not configured yet.

I suggest you to read [About the App](https://github.com/AlkTheOrg/imdb-watchlist-randomizer/blob/main/ABOUT.md#about-the-extension) before using the extension.

## Requirements

- Node.js `>=22.12.0`
- pnpm `10.10.0`
- Google Chrome

The required pnpm version is declared in `package.json` and can be activated with Corepack.

## Development

Install dependencies:

```bash
pnpm install
```

Start the development workflow:

```bash
pnpm dev
```

This performs an initial type-check and development build, watches TypeScript and source files, launches Chromium with the unpacked extension from `dist/`, and reloads the extension when the generated files change.

Create a production build without launching the browser:

```bash
pnpm build
```

The generated extension is written to `dist/`. It can also be loaded manually from `chrome://extensions` after enabling Developer mode and choosing **Load unpacked**.

## Code quality

| Command              | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| `pnpm fmt`           | Format supported files with Oxfmt                |
| `pnpm fmt:check`     | Check formatting without changing files          |
| `pnpm lint`          | Check source files with Oxlint                   |
| `pnpm lint:fix`      | Apply safe automatic Oxlint fixes                |
| `pnpm test`          | Run unit tests once with Vitest                  |
| `pnpm test:watch`    | Re-run relevant unit tests as files change       |
| `pnpm typecheck`     | Type-check the project without emitting files    |
| `pnpm build`         | Verify that the production extension can build   |
| `pnpm version:check` | Verify that project and extension versions match |

Unit tests cover the pure randomization logic. For extension behavior changes, run `pnpm dev` and test the extension manually against an IMDb watchlist.

## Commit messages

Use the Conventional Commits-style format `<type>: <imperative summary>`. Common types include `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `build`, `ci`, and `chore`.

For example:

```text
feat: add Firefox manifest support
```

## Versioning

`package.json` is the source of truth for the project version. Use the version command to update it together with `public/manifest.json`:

```bash
pnpm version:bump patch
```

The command also accepts `minor`, `major`, or an explicit numeric version such as `1.4.0`. It changes the files without creating a commit or Git tag, so you can review and commit the release separately. Production builds run `pnpm version:check` first and fail when the versions do not match.

## VS Code

The repository recommends the official Oxc extension and enables Oxfmt on save through workspace settings. VS Code will prompt you to install the recommendation when you open the project. Other editors can use the same local Oxfmt installation and `.oxfmtrc.json` configuration through their Oxfmt integration.
