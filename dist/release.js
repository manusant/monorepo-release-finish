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
exports.getExistingTags = exports.createReleaseTag = exports.createRelease = exports.createReleaseVersion = void 0;
function createReleaseVersion(octokit, requestDefaults) {
    return __awaiter(this, void 0, void 0, function* () {
        const date = new Date();
        const yyyy = date.getUTCFullYear();
        const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(date.getUTCDate()).padStart(2, "0");
        const baseTagName = `v-${yyyy}-${mm}-${dd}`;
        const existingTagNames = yield getExistingTags(octokit, requestDefaults);
        let tagName = baseTagName;
        let index = 0;
        while (existingTagNames.includes(tagName)) {
            index += 1;
            tagName = `${baseTagName}.${index}`;
        }
        return tagName;
    });
}
exports.createReleaseVersion = createReleaseVersion;
function createRelease(octokit, requestDefaults, releaseTag, releaseDescription, draft) {
    return __awaiter(this, void 0, void 0, function* () {
        const releaseResponse = yield octokit.rest.repos.createRelease(Object.assign(Object.assign({}, requestDefaults), { tag_name: releaseTag, name: releaseTag, body: releaseDescription, draft: draft, prerelease: false }));
        if (releaseResponse.status === 201) {
            if (draft) {
                console.log("Created draft release! Click Publish to notify users.");
            }
            else {
                console.log("Published release!");
            }
            console.log(releaseResponse.data.html_url);
        }
        else {
            console.error(releaseResponse);
            throw new Error("Something went wrong when creating the release.");
        }
    });
}
exports.createRelease = createRelease;
function createReleaseTag(octokit, requestDefaults, commitId, version) {
    return __awaiter(this, void 0, void 0, function* () {
        let releaseVersion;
        if (version) {
            releaseVersion = version;
            const existingTags = yield getExistingTags(octokit, requestDefaults);
            if (existingTags.includes(version)) {
                throw Error(`Tag ${version} already exists. Please provide a different release name.`);
            }
        }
        else {
            releaseVersion = yield createReleaseVersion(octokit, requestDefaults);
        }
        const annotatedTag = yield octokit.rest.git.createTag(Object.assign(Object.assign({}, requestDefaults), { tag: releaseVersion, message: releaseVersion, object: commitId, type: "commit" }));
        yield octokit.rest.git.createRef(Object.assign(Object.assign({}, requestDefaults), { ref: `refs/tags/${releaseVersion}`, sha: annotatedTag.data.sha }));
        return releaseVersion;
    });
}
exports.createReleaseTag = createReleaseTag;
function getExistingTags(octokit, requestDefaults) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingTags = yield octokit.rest.repos.listTags(Object.assign(Object.assign({}, requestDefaults), { per_page: 100 }));
        return existingTags.data.map(obj => obj.name);
    });
}
exports.getExistingTags = getExistingTags;
//# sourceMappingURL=release.js.map