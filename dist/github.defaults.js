"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubDefaults = void 0;
const github_1 = require("@actions/github");
function githubDefaults() {
    return Object.assign(Object.assign({}, github_1.context.repo), { 
        /**
         * This accept header is required when calling App APIs in GitHub Enterprise.
         * It has no effect on calls to github.com
         */
        headers: {
            Accept: "application/vnd.github.machine-man-preview+json"
        } });
}
exports.githubDefaults = githubDefaults;
//# sourceMappingURL=github.defaults.js.map