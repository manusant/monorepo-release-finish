import { unified } from "unified";
import remarkParse from "remark-parse";
import { toString } from "mdast-util-to-string";
import remarkStringify from "remark-stringify";
import { Package } from "@manypkg/get-packages";
import fs from "fs-extra";
import path from "path";
import { ChangelogEntry } from "./types";
import { getChangedPackages, groupPackagesByPath } from "./packages";

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
function getChangelogEntry(changelog: string, version: string) {
  const ast = unified()
    .use(remarkParse)
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
      const stringified = toString(node);
      const match = stringified.toLowerCase().match(/(major|minor|patch)/);
      if (match !== null) {
        // as "major" | "minor" | "patch"
        // @ts-ignore
        const level: number = BumpLevels[match[0]];
        highestLevel = Math.max(level, highestLevel);
      }
      if (headingStartInfo === undefined && stringified === version) {
        headingStartInfo = {
          index: i,
          depth: node.depth
        };
        continue;
      }
      if (
        endIndex === undefined &&
        headingStartInfo &&
        headingStartInfo.depth === node.depth
      ) {
        endIndex = i;
        break;
      }
    }
  }

  if (headingStartInfo) {
    ast.children = ast.children.slice(headingStartInfo.index + 1, endIndex);
  }
  return {
    content: unified()
      .use(remarkStringify)
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
function sortChangesets(
  changesetA: ChangelogEntry,
  changesetB: ChangelogEntry
) {
  if (changesetA.private === changesetB.private) {
    return changesetB.highestLevel - changesetA.highestLevel;
  }
  if (changesetA.private) {
    return 1;
  }
  return -1;
}

function buildChangelogEntries(changedPackages: Package[]): ChangelogEntry[] {
  return changedPackages
    .filter(pkg => fs.existsSync(path.join(pkg.dir, "CHANGELOG.md")))
    .map(pkg => {
      const changelogContents = fs.readFileSync(
        path.join(pkg.dir, "CHANGELOG.md"),
        "utf8"
      );
      const entry = getChangelogEntry(
        changelogContents,
        pkg.packageJson.version
      );
      return {
        highestLevel: entry.highestLevel,
        private: !!pkg.packageJson.private,
        content: `## ${pkg.packageJson.name}@${pkg.packageJson.version}\n\n${entry.content}`
      };
    });
}

export async function createReleaseNotes(
  previousPackages: string
): Promise<string> {
  const dir = process.cwd();
  const previousPackageVersions = groupPackagesByPath(
    JSON.parse(previousPackages)
  );
  const changedPackages = getChangedPackages(dir, previousPackageVersions);

  if (changedPackages.length === 0) {
    throw Error(
      "No pending release was found, consequently there is no release notes available."
    );
  }
  const changelogEntries = buildChangelogEntries(changedPackages);
  return changelogEntries
    .filter(x => x)
    .sort(sortChangesets)
    .map(x => x.content)
    .join("\n ");
}
