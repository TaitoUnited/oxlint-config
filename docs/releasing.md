# Releasing

Releases are published to npm manually by a maintainer with [np](https://github.com/sindresorhus/np). Nothing is published automatically. CI only verifies the code.

## Prerequisites

- An npm account in the [`@taito`](https://www.npmjs.com/org/taito) organization with publish rights, and two-factor authentication enabled.
- Logged in locally: `npm login`, then check with `npm whoami`.
- Push access to the GitHub repository.
- An up-to-date `main` branch with green CI and a clean working tree.

np is a dev dependency of this repository, configured in the `np` field of [`package.json`](../package.json):

| Setting      | Value                | Effect                                                       |
| ------------ | -------------------- | ------------------------------------------------------------ |
| `branch`     | `main`               | Releases are only allowed from `main`.                       |
| `testScript` | `verify`             | Runs lint, the format check and the tests before publishing. |
| `message`    | `chore: release v%s` | Commit message for the version bump.                         |

## Versioning

The package follows [Semantic Versioning](https://semver.org/). For a lint config, that means:

| Change                                                                                                                     | Version                       |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| A rule enabled in a preset, a rule made stricter, a preset or export removed, the minimum Oxlint or Node.js version raised | **major** (before 1.0: minor) |
| A new preset, a new opt-in rule, a new rule option, a rule relaxed or disabled                                             | **minor** (before 1.0: patch) |
| Bug fixes (false positives or negatives), documentation                                                                    | **patch**                     |

## Steps

1. **Update the changelog.** In [`CHANGELOG.md`](../CHANGELOG.md), move the `Unreleased` entries under a new version heading with today's date. Update the link references at the bottom: point `[Unreleased]` to `compare/v<version>...HEAD` and add `[<version>]: https://github.com/TaitoUnited/oxlint-config/compare/v<previous>...v<version>`. Commit the change to `main`, because np requires a clean working tree.

2. **Check the package contents:**

   ```sh
   npm run pack:check
   ```

   The tarball should contain only `configs/`, `plugin/` (without `*.test.js`), `README.md`, `CHANGELOG.md`, `LICENSE` and `package.json`.

3. **Preview the release** (optional). Dry-run mode shows what np would do without committing, pushing or publishing anything:

   ```sh
   npm run release -- --dry-run
   ```

4. **Release:**

   ```sh
   npm run release
   ```

   np asks for the version (patch, minor, major or an exact version) and then:
   1. checks that you are on `main`, the working tree is clean and there are no unpulled changes;
   2. reinstalls dependencies and runs `npm run verify`;
   3. bumps the version in `package.json` and `package-lock.json`, commits it and creates the `v<version>` tag;
   4. publishes to npm and asks for your two-factor authentication code. `prepublishOnly` runs `verify` once more first;
   5. pushes the commit and the tag to GitHub;
   6. opens a prefilled GitHub release draft in the browser.

   If publishing fails, np rolls back the version commit and the tag.

5. **Publish the GitHub release.** In the draft, replace the generated notes with the version's section from `CHANGELOG.md` and publish it.

### Pre-releases

Pass a pre-release version and a dist-tag, so that the version does not become `latest`:

```sh
npm run release -- prerelease --tag beta
npm run release -- 1.0.0-beta.0 --tag beta
```

np refuses to publish a pre-release version under the `latest` tag.

### Smoke testing a release candidate

For major changes, try the packed package in a real project before releasing:

```sh
npm pack
cd ../some-project
npm install --save-dev ../oxlint-config/taito-oxlint-config-<version>.tgz
npx oxlint
```

## After publishing

- Check the package page: `npm view @taito/oxlint-config`.
- To fix a broken release, publish a new patch version. Use `npm deprecate @taito/oxlint-config@<version> "<reason>"` to warn users of the broken version. Avoid `npm unpublish`, because npm only allows it within 72 hours and it breaks lockfiles.

## Without np

np runs the same steps that you can run by hand:

```sh
npm ci
npm run verify
npm version <major|minor|patch> -m "chore: release v%s"
npm publish
git push origin main --follow-tags
gh release create v<version> --title v<version> --notes-file <(awk '/^## \[<version>\]/{f=1;next} /^## \[|^\[/{f=0} f' CHANGELOG.md)
```

## Automating later (optional)

np is meant to be run locally. To publish from CI instead, configure [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) for this repository, add a `workflow_dispatch` workflow that runs `npm ci`, `npm run verify` and `npm publish --provenance`, and protect it with a GitHub environment. With provenance, npm shows that a version was built from this repository.
