export declare const setupUser: (user: string, email: string) => Promise<void>;
export declare const push: (branch: string, { force }?: {
    force?: boolean | undefined;
}) => Promise<void>;
export declare const switchToMaybeExistingBranch: (branch: string) => Promise<void>;
export declare const reset: (pathSpec: string, mode?: "hard" | "soft" | "mixed") => Promise<void>;
export declare const pull: (branch: string) => Promise<void>;
export declare const status: () => Promise<void>;
export declare const commitAll: (message: string, commitFileException: string[]) => Promise<void>;
export declare const checkIfClean: () => Promise<boolean>;
export declare const commitId: () => Promise<string>;
export declare const merge: (branch: string) => Promise<string>;
