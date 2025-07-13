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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReleaseNotes = void 0;
const unified_1 = require("unified");
const remark_parse_1 = __importDefault(require("remark-parse"));
const mdast_util_to_string_1 = require("mdast-util-to-string");
const remark_stringify_1 = __importDefault(require("remark-stringify"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const packages_1 = require("./packages");
const BumpLevels = {
    dep: 0,
    patch: 1,
    minor: 2,
    major: 3
};
/**
 *
 * @param changelog
 * @param version
 * @returns {{highestLevel: number, content: Node}}
 */
function getChangelogEntry(changelog, version) {
    const ast = (0, unified_1.unified)()
        .use(remark_parse_1.default)
        .parse(changelog);
    const nodes = ast.children;
    /**
     * @type {{ index: number; depth: number; } | undefined }
     */
    let headingStartInfo;
    /**
     * @type {number | undefined}
     */
    let highestLevel = BumpLevels.dep;
    let endIndex;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.type === "heading") {
            const stringified = (0, mdast_util_to_string_1.toString)(node);
            const match = stringified.toLowerCase().match(/(major|minor|patch)/);
            if (match !== null) {
                // as "major" | "minor" | "patch"
                // @ts-ignore
                const level = BumpLevels[match[0]];
                highestLevel = Math.max(level, highestLevel);
            }
            if (headingStartInfo === undefined && stringified === version) {
                headingStartInfo = {
                    index: i,
                    depth: node.depth
                };
                continue;
            }
            if (endIndex === undefined &&
                headingStartInfo &&
                headingStartInfo.depth === node.depth) {
                endIndex = i;
                break;
            }
        }
    }
    if (headingStartInfo) {
        ast.children = ast.children.slice(headingStartInfo.index + 1, endIndex);
    }
    return {
        content: (0, unified_1.unified)()
            .use(remark_stringify_1.default)
            .stringify(ast),
        highestLevel
    };
}
/**
 *
 * @param changesetA {{ private: boolean; highestLevel: number }}
 * @param changesetB {{ private: boolean; highestLevel: number }}
 * @returns {number}
 */
function sortChangesets(changesetA, changesetB) {
    if (changesetA.private === changesetB.private) {
        return changesetB.highestLevel - changesetA.highestLevel;
    }
    if (changesetA.private) {
        return 1;
    }
    return -1;
}
function buildChangelogEntries(changedPackages) {
    return changedPackages
        .filter(pkg => fs_extra_1.default.existsSync(path_1.default.join(pkg.dir, "CHANGELOG.md")))
        .map(pkg => {
        const changelogContents = fs_extra_1.default.readFileSync(path_1.default.join(pkg.dir, "CHANGELOG.md"), "utf8");
        const entry = getChangelogEntry(changelogContents, pkg.packageJson.version);
        return {
            highestLevel: entry.highestLevel,
            private: !!pkg.packageJson.private,
            content: `## ${pkg.packageJson.name}@${pkg.packageJson.version}\n\n${entry.content}`
        };
    });
}
function createReleaseNotes(previousPackages) {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = process.cwd();
        const previousPackageVersions = (0, packages_1.groupPackagesByPath)(JSON.parse(previousPackages));
        const changedPackages = (0, packages_1.getChangedPackages)(dir, previousPackageVersions);
        if (changedPackages.length === 0) {
            throw Error("No pending release was found, consequently there is no release notes available.");
        }
        const changelogEntries = buildChangelogEntries(changedPackages);
        return changelogEntries
            .filter(x => x)
            .sort(sortChangesets)
            .map(x => x.content)
            .join("\n ");
    });
}
exports.createReleaseNotes = createReleaseNotes;
//# sourceMappingURL=release-notes.js.map