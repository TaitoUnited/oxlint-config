# Releasing

Releases are published to npm manually by a maintainer. Nothing is published automatically. CI only verifies the code.

## Prerequisites

- An npm account in the [`@taito`](https://www.npmjs.com/org/taito) organization with publish rights, and two-factor authentication enabled.
- Logged in locally: `npm login`, then check with `npm whoami`.
- A clean checkout of an up-to-date `main` branch with green CI.

## Versioning

The package follows [Semantic Versioning](https://semver.org/). For a lint config, that means:

| Change                                                                                                                     | Version                       |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| A rule enabled in a preset, a rule made stricter, a preset or export removed, the minimum Oxlint or Node.js version raised | **major** (before 1.0: minor) |
| A new preset, a new opt-in rule, a new rule option, a rule relaxed or disabled                                             | **minor** (before 1.0: patch) |
| Bug fixes (false positives or negatives), documentation                                                                    | **patch**                     |

## Steps

1. **Update the changelog.** Move the `Unreleased` entries in [`CHANGELOG.md`](CHANGELOG.md) under a new version heading with today's date. Update the link references at the bottom: point `[Unreleased]` to `compare/v<version>...HEAD` and add `[<version>]: https://github.com/TaitoUnited/oxlint-config/compare/v<previous>...v<version>`.

2. **Bump the version** without creating a tag yet:

   ```sh
   npm version <major|minor|patch> --no-git-tag-version
   ```

   For a pre-release, use `npm version prerelease --preid beta --no-git-tag-version`.

3. **Verify** the code and the package contents:

   ```sh
   npm ci
   npm run verify
   npm pack --dry-run
   ```

   The tarball should contain only `configs/`, `plugin/` (without `*.test.js`), `README.md`, `CHANGELOG.md`, `LICENSE` and `package.json`.

4. **Smoke test the tarball** in a real project (optional, but recommended for major changes):

   ```sh
   npm pack
   cd ../some-project
   npm install --save-dev ../oxlint-config/taito-oxlint-config-<version>.tgz
   npx oxlint
   ```

5. **Commit and tag:**

   ```sh
   git commit -am "chore: release v<version>"
   git tag v<version>
   git push origin main --tags
   ```

6. **Publish:**

   ```sh
   npm publish                 # stable release, gets the "latest" dist-tag
   npm publish --tag beta      # pre-release, so it does not become "latest"
   ```

   `prepublishOnly` runs `npm run verify` again first. `publishConfig.access` is `public`, which scoped packages require.

7. **Create a GitHub release** from the tag and paste the changelog section:

   ```sh
   gh release create v<version> --title v<version> --notes-file <(awk '/^## \[<version>\]/{f=1;next} /^## \[|^\[/{f=0} f' CHANGELOG.md)
   ```

## After publishing

- Check the package page: `npm view @taito/oxlint-config`.
- To fix a broken release, publish a new patch version. Use `npm deprecate @taito/oxlint-config@<version> "<reason>"` to warn users of the broken version. Avoid `npm unpublish`, because npm only allows it within 72 hours and it breaks lockfiles.

## Automating later (optional)

To publish from CI instead, configure [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) for this repository, add a `workflow_dispatch` workflow that runs `npm ci`, `npm run verify` and `npm publish --provenance`, and protect it with a GitHub environment. With provenance, npm shows that a version was built from this repository.
