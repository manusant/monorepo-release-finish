import { GitHub } from "@actions/github/lib/utils";
import { GithubDefaults } from "./github.defaults";

export async function createReleaseVersion(octokit, requestDefaults) {
  const date = new Date();
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const baseTagName = `v-${yyyy}-${mm}-${dd}`;

  const existingTagNames = await getExistingTags(octokit, requestDefaults);

  let tagName = baseTagName;
  let index = 0;
  while (existingTagNames.includes(tagName)) {
    index += 1;
    tagName = `${baseTagName}.${index}`;
  }
  return tagName;
}

export async function createRelease(
  octokit: InstanceType<typeof GitHub>,
  requestDefaults: GithubDefaults,
  releaseTag: string,
  releaseDescription: string,
  draft: boolean
) {
  const releaseResponse = await octokit.rest.repos.createRelease({
    ...requestDefaults,
    tag_name: releaseTag,
    name: releaseTag,
    body: releaseDescription,
    draft: draft,
    prerelease: false
  });

  if (releaseResponse.status === 201) {
    if (draft) {
      console.log("Created draft release! Click Publish to notify users.");
    } else {
      console.log("Published release!");
    }
    console.log(releaseResponse.data.html_url);
  } else {
    console.error(releaseResponse);
    throw new Error("Something went wrong when creating the release.");
  }
}

export async function createReleaseTag(
  octokit: InstanceType<typeof GitHub>,
  requestDefaults: GithubDefaults,
  commitId: string,
  version?: string
) {
  let releaseVersion: string;
  if (version) {
    releaseVersion = version;
    const existingTags = await getExistingTags(octokit, requestDefaults);
    if (existingTags.includes(version)) {
      throw Error(
        `Tag ${version} already exists. Please provide a different release name.`
      );
    }
  } else {
    releaseVersion = await createReleaseVersion(octokit, requestDefaults);
  }

  const annotatedTag = await octokit.rest.git.createTag({
    ...requestDefaults,
    tag: releaseVersion,
    message: releaseVersion,
    object: commitId,
    type: "commit"
  });

  await octokit.rest.git.createRef({
    ...requestDefaults,
    ref: `refs/tags/${releaseVersion}`,
    sha: annotatedTag.data.sha
  });
  return releaseVersion;
}

export async function getExistingTags(
  octokit: InstanceType<typeof GitHub>,
  requestDefaults: GithubDefaults
) {
  const existingTags = await octokit.rest.repos.listTags({
    ...requestDefaults,
    per_page: 100
  });
  return existingTags.data.map(obj => obj.name);
}
