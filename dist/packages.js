"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChangedPackages = exports.groupPackagesByPath = void 0;
const get_packages_1 = require("@manypkg/get-packages");
function groupPackagesByPath(packages) {
    return new Map(packages.map(pkg => [pkg.path, pkg.version]));
}
exports.groupPackagesByPath = groupPackagesByPath;
function getChangedPackages(cwd, previousVersions) {
    const { packages } = (0, get_packages_1.getPackagesSync)(cwd);
    const changedPackages = new Set();
    for (const pkg of packages) {
        const previousVersion = previousVersions.get(pkg.dir);
        if (previousVersion !== pkg.packageJson.version) {
            changedPackages.add(pkg);
        }
    }
    return Array.from(changedPackages.values());
}
exports.getChangedPackages = getChangedPackages;
//# sourceMappingURL=packages.js.map