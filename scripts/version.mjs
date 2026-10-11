import { readFile, writeFile } from "node:fs/promises";

const packageJsonUrl = new URL("../package.json", import.meta.url);
const manifestUrl = new URL("../public/manifest.json", import.meta.url);
const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

const readJson = async (url) => JSON.parse(await readFile(url, "utf8"));
const formatJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

const parseVersion = (version) => {
  const match = versionPattern.exec(version);

  if (!match) {
    throw new Error(`Expected a numeric major.minor.patch version, received "${version}".`);
  }

  const parts = match.slice(1).map(Number);

  if (parts.every((part) => part === 0) || parts.some((part) => part > 65_535)) {
    throw new Error(`Version "${version}" is not valid for a Chrome extension.`);
  }

  return parts;
};

const packageJson = await readJson(packageJsonUrl);
const manifest = await readJson(manifestUrl);
const command = process.argv[2] ?? "check";

if (command === "check") {
  parseVersion(packageJson.version);

  if (packageJson.version !== manifest.version) {
    throw new Error(
      `Version mismatch: package.json is ${packageJson.version}, but manifest.json is ${manifest.version}.`,
    );
  }

  console.log(`Versions match: ${packageJson.version}`);
  process.exit(0);
}

const [major, minor, patch] = parseVersion(packageJson.version);
let nextVersion;

switch (command) {
  case "major":
    nextVersion = `${major + 1}.0.0`;
    break;
  case "minor":
    nextVersion = `${major}.${minor + 1}.0`;
    break;
  case "patch":
    nextVersion = `${major}.${minor}.${patch + 1}`;
    break;
  default:
    parseVersion(command);
    nextVersion = command;
}

parseVersion(nextVersion);
packageJson.version = nextVersion;
manifest.version = nextVersion;

await Promise.all([
  writeFile(packageJsonUrl, formatJson(packageJson)),
  writeFile(manifestUrl, formatJson(manifest)),
]);

console.log(`Updated package.json and manifest.json to ${nextVersion}`);
