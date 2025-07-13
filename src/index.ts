import { getOctokit } from "@actions/github";
import {
  getBooleanInput,
  getInput,
  getMultilineInput,
  setFailed,
  setOutput
} from "@actions/core";
import { createRelease, createReleaseTag } from "./release";
import {
  commitAll,
  commitId,
  merge,
  pull,
  push,
  setupUser,
  status,
  switchToMaybeExistingBranch
} from "./git";
import { createReleaseNotes } from "./release-notes";
import { githubDefaults } from "./github.defaults";

async function run() {
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    setFailed(
      "Please add the GITHUB_TOKEN to the monorepo-release-finish action env"
    );
    return;
  }

  const workingBranch = getInput("branch");
  if (!workingBranch) {
    setFailed("Working workingBranch is required as input");
    return;
  }
  const previousPackages = getInput("previousPackages");
  if (!previousPackages) {
    setFailed("Previous packages is required as input");
    return;
  }

  const version = getInput("version");
  const pushToRemote = getBooleanInput("push") ?? true;
  const draft = getBooleanInput("draft");
  if (draft) {
    console.log(
      "\nRunning release in Dry Run mode. It will output details, will create a draft release but will NOT publish it."
    );
  }
  const releaseBranch = getInput("releaseBranch");

  console.log(`Starting Release Finish for version ${version}`);
  const octokit = getOctokit(githubToken);
  const defaults = githubDefaults();

  await setupUser(getInput("git-user-name"), getInput("git-user-email"));

  let commitFileException = getMultilineInput("commitFileException") ?? [];

  // Commit release changes
  await commitAll(`Release '${version}'`, commitFileException);

  if (pushToRemote) {
    // Push changes to working workingBranch
    await push(workingBranch);

    const releaseCommit = await commitId();

    if (releaseCommit.length) {
      setOutput("releaseCommit", releaseCommit);

      // Create release tag on GitHub
      const tagName = await createReleaseTag(
        octokit,
        defaults,
        releaseCommit,
        version
      );
      setOutput("releaseTag", tagName);

      // Build release notes
      const releaseNotes = await createReleaseNotes(previousPackages);
      setOutput("releaseNotes", releaseNotes);

      // Create release on GitHub
      await createRelease(octokit, defaults, tagName, releaseNotes, draft);

      // finally merge release to release branch if not the same as working branch
      if (releaseBranch && releaseBranch !== workingBranch) {
        console.log(`Merging Release ${version} to ${releaseBranch} branch`);
        await switchToMaybeExistingBranch(releaseBranch);
        await pull(releaseBranch);
        await status();
        await merge(workingBranch);
        await push(releaseBranch);
      }
    } else {
      setFailed("No release commit id found. Please check your pipeline.");
    }
  } else {
    console.log(
      `Skipping committing and pushing to the repository. The option <push> is set to <false>`
    );
  }
}

run().catch(error => {
  console.error(error);
  setFailed(`Release Finish failed: ${error.message}`);
});
