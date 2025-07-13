import { exec } from "@actions/exec";
import { setFailed } from "@actions/core";
import { which } from "@actions/io";

export type ExecResult = {
  exitCode: number;
  output: string;
  errors: string;
};

export async function execWithOutput(
  command: string,
  args?: string[]
): Promise<ExecResult> {
  const execPath = await which(command, true);

  let output = "";
  let errors = "";
  const env = {
    ...process.env
  };

  const options: any = { env };
  options.listeners = {
    stdout: data => {
      output += data.toString();
    },
    stderr: (data: Buffer) => {
      errors += data.toString();
    }
  };

  const exitCode = await exec(execPath, args, options);
  if (exitCode !== 0) {
    setFailed(`Failed executing command ${command} with exitcode: ${exitCode}`);
  }
  return {
    exitCode,
    output,
    errors
  };
}
