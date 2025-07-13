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
exports.execWithOutput = void 0;
const exec_1 = require("@actions/exec");
const core_1 = require("@actions/core");
const io_1 = require("@actions/io");
function execWithOutput(command, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const execPath = yield (0, io_1.which)(command, true);
        let output = "";
        let errors = "";
        const env = Object.assign({}, process.env);
        const options = { env };
        options.listeners = {
            stdout: data => {
                output += data.toString();
            },
            stderr: (data) => {
                errors += data.toString();
            }
        };
        const exitCode = yield (0, exec_1.exec)(execPath, args, options);
        if (exitCode !== 0) {
            (0, core_1.setFailed)(`Failed executing command ${command} with exitcode: ${exitCode}`);
        }
        return {
            exitCode,
            output,
            errors
        };
    });
}
exports.execWithOutput = execWithOutput;
//# sourceMappingURL=exec.js.map