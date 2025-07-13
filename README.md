# monorepo-release-finish

Finalizes a Changeset based release flow for a monorepo project.

When finalizing it will:

1. Commit all changes from the changeset release and push them
2. Create a release tag on GitHub
3. Create a release on GitHub
4. Merge release commit into master branch

## Inputs

### `branch`

[_required_] Working branch. Normally the develop branch.

### `releaseBranch`

[_optional_] release branch. Use it if you have a release branch where release commits should be added (normally master branch).

### `previousPackages`

[_required_] JSON array of previous package versions.

### `commitFileException`

[_optional_] JSON array of files to exclude from commit.

### `version`

[_optional_] Release version. To be used for the git tag and GitHub release name. If not specified, a new version will
be created automatically.

### `draft`

[_optional_] Create a draft release on GitHub. Default: _false_

### `push`

[_optional_] Allow release output to be published to upstream branches. Default: _true_

## Outputs

### `releaseCommit`

Git commit Id for the release changes.

### `releaseTag`

Git tag for the release.

### `releaseNotes`

Release notes. Includes release change-set.

## Example usage

```yaml
- name: Finish monorepo release
  id: finish-monorepo-release  # this can be whatever you'd like. It's just an id so that we can reference the step in github actions
  uses: dh-io-actions/monorepo-release-finish@v1
  with:
    branch: develop
    draft: false
    push: true
    version: ${{ steps.start-monorepo-release.outputs.version }}
    previousPackages: ${{ steps.start-monorepo-release.outputs.oldPackagesVersions }}
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}  
```

```yaml
- name: Print monorepo release-finish output
  shell: bash
  run: |
      echo Release Commit: ${{ steps.finish-monorepo-release.outputs.releaseCommit }}
      echo Release Tag: ${{ steps.finish-monorepo-release.outputs.releaseTag }}
      echo Release Notes: ${{ steps.finish-monorepo-release.outputs.releaseNotes }}
```

## Release Use-case

```yaml
name: Release

on:
  workflow_dispatch:

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: [ ubuntu-latest ]
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x

      - name: Install Dependencies
        run: yarn install

      - name: Start monorepo release
        id: start-monorepo-release
        uses: manusant/monorepo-release-start@1.0.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Finish monorepo release
        id: finish-monorepo-release
        if: steps.start-monorepo-release.outputs.released
        uses: manusant/monorepo-release-finish@1.0.0
        with:
          branch: develop
          releaseBranch: master
          draft: false
          push: true
          version: ${{ steps.start-monorepo-release.outputs.version }}
          previousPackages: ${{ steps.start-monorepo-release.outputs.oldPackagesVersions }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
