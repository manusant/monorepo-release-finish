"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.merge = exports.commitId = exports.checkIfClean = exports.commitAll = exports.status = exports.pull = exports.reset = exports.switchToMaybeExistingBranch = exports.push = exports.setupUser = void 0;
const exec_1 = require("@actions/exec");
const exec_2 = require("./exec");
const setupUser = (user, email) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exec_1.exec)("git", ["config", "--global", "user.email", `"${email}"`]);
    yield (0, exec_1.exec)("git", ["config", "--global", "user.name", `"${user}"`]);
});
exports.setupUser = setupUser;
const push = (branch, { force } = {}) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exec_1.exec)("git", ["push", "origin", `HEAD:${branch}`, force && "--force"].filter(Boolean));
});
exports.push = push;
const switchToMaybeExistingBranch = (branch) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors } = yield (0, exec_2.execWithOutput)("git", ["checkout", branch]);
    const isCreatingBranch = !errors.includes(`Switched to a new branch '${branch}'`);
    if (isCreatingBranch) {
        yield (0, exec_1.exec)("git", ["checkout", "-b", branch]);
    }
});
exports.switchToMaybeExistingBranch = switchToMaybeExistingBranch;
const reset = (pathSpec, mode = "hard") => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exec_1.exec)("git", ["reset", `--${mode}`, pathSpec]);
});
exports.reset = reset;
const pull = (branch) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exec_1.exec)("git", [
        "pull",
        "origin",
        `${branch}`,
        "--allow-unrelated-histories"
    ]);
});
exports.pull = pull;
const status = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exec_1.exec)("git", ["status"]);
});
exports.status = status;
const commitAll = (message, commitFileException) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exec_1.exec)("git", ["add", "."]);
    for (const file of commitFileException) {
        yield (0, exec_1.exec)("git", ["reset", file]);
        yield (0, exec_1.exec)("git", ["checkout", file]);
    }
    yield (0, exec_1.exec)("git", ["commit", "-m", message, "--no-verify"]);
});
exports.commitAll = commitAll;
const checkIfClean = () => __awaiter(void 0, void 0, void 0, function* () {
    const { output } = yield (0, exec_2.execWithOutput)("git", ["status", "--porcelain"]);
    return !output.length;
});
exports.checkIfClean = checkIfClean;
const commitId = () => __awaiter(void 0, void 0, void 0, function* () {
    let { output } = yield (0, exec_2.execWithOutput)("git", [
        "rev-parse",
        "--verify",
        "HEAD"
    ]);
    return output.replace("\n", "").replace("\\n", "");
});
exports.commitId = commitId;
const merge = (branch) => __awaiter(void 0, void 0, void 0, function* () {
    let { output } = yield (0, exec_2.execWithOutput)("git", [
        "merge",
        `origin/${branch}`,
        "--verbose"
    ]);
    return output.replace("\n", "").replace("\\n", "");
});
exports.merge = merge;
//# sourceMappingURL=git.js.map