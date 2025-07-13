export type ExecResult = {
    exitCode: number;
    output: string;
    errors: string;
};
export declare function execWithOutput(command: string, args?: string[]): Promise<ExecResult>;
