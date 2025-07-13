import { context } from "@actions/github";
export type GithubDefaults = typeof context.repo & {
    headers: Record<string, string | number | undefined>;
};
export declare function githubDefaults(): GithubDefaults;
