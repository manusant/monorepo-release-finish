import { context } from "@actions/github";

export type GithubDefaults = typeof context.repo & {
  headers: Record<string, string | number | undefined>;
};

export function githubDefaults(): GithubDefaults {
  return {
    ...context.repo,
    /**
     * This accept header is required when calling App APIs in GitHub Enterprise.
     * It has no effect on calls to github.com
     */
    headers: {
      Accept: "application/vnd.github.machine-man-preview+json"
    }
  };
}
