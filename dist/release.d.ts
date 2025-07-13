import { GitHub } from "@actions/github/lib/utils";
import { GithubDefaults } from "./github.defaults";
export declare function createReleaseVersion(octokit: any, requestDefaults: any): Promise<string>;
export declare function createRelease(octokit: InstanceType<typeof GitHub>, requestDefaults: GithubDefaults, releaseTag: string, releaseDescription: string, draft: boolean): Promise<void>;
export declare function createReleaseTag(octokit: InstanceType<typeof GitHub>, requestDefaults: GithubDefaults, commitId: string, version?: string): Promise<string>;
export declare function getExistingTags(octokit: InstanceType<typeof GitHub>, requestDefaults: GithubDefaults): Promise<string[]>;
