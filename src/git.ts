import { exec } from "@actions/exec";
import { execWithOutput } from "./exec";

export const setupUser = async (user: string, email: string) => {
  await exec("git", ["config", "--global", "user.email", `"${email}"`]);
  await exec("git", ["config", "--global", "user.name", `"${user}"`]);
};

export const push = async (
  branch: string,
  { force }: { force?: boolean } = {}
) => {
  await exec(
    "git",
    ["push", "origin", `HEAD:${branch}`, force && "--force"].filter<string>(
      Boolean as any
    )
  );
};

export const switchToMaybeExistingBranch = async (branch: string) => {
  const { errors } = await execWithOutput("git", ["checkout", branch]);
  const isCreatingBranch = !errors.includes(
    `Switched to a new branch '${branch}'`
  );
  if (isCreatingBranch) {
    await exec("git", ["checkout", "-b", branch]);
  }
};

export const reset = async (
  pathSpec: string,
  mode: "hard" | "soft" | "mixed" = "hard"
) => {
  await exec("git", ["reset", `--${mode}`, pathSpec]);
};

export const pull = async (branch: string) => {
  await exec("git", [
    "pull",
    "origin",
    `${branch}`,
    "--allow-unrelated-histories"
  ]);
};

export const status = async () => {
  await exec("git", ["status"]);
};

export const commitAll = async (
  message: string,
  commitFileException: string[]
) => {
  await exec("git", ["add", "."]);

  for (const file of commitFileException) {
    await exec("git", ["reset", file]);
    await exec("git", ["checkout", file]);
  }

  await exec("git", ["commit", "-m", message, "--no-verify"]);
};

export const checkIfClean = async (): Promise<boolean> => {
  const { output } = await execWithOutput("git", ["status", "--porcelain"]);
  return !output.length;
};

export const commitId = async (): Promise<string> => {
  let { output } = await execWithOutput("git", [
    "rev-parse",
    "--verify",
    "HEAD"
  ]);
  return output.replace("\n", "").replace("\\n", "");
};

export const merge = async (branch: string): Promise<string> => {
  let { output } = await execWithOutput("git", [
    "merge",
    `origin/${branch}`,
    "--verbose"
  ]);
  return output.replace("\n", "").replace("\\n", "");
};
