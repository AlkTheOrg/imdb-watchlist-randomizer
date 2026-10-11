# Repository instructions

- Treat the version in `package.json` as canonical. Use `pnpm version:bump <major|minor|patch|version>` to update it together with `public/manifest.json`.
- After editing supported source, configuration, or documentation files, run `pnpm fmt`.
- Before finishing a code change, run `pnpm test`, `pnpm lint`, and `pnpm typecheck`.
- Run `pnpm build` when changing build configuration, dependencies, extension entry points, or release-related files, or when preparing a release.
- Manually test extension behavior changes in the Chromium instance started by `pnpm dev`.
