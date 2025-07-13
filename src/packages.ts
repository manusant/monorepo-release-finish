import { JsonPackage } from "./types";
import { getPackagesSync, Package } from "@manypkg/get-packages";

export function groupPackagesByPath(
  packages: JsonPackage[]
): Map<string, string> {
  return new Map(packages.map(pkg => [pkg.path, pkg.version]));
}

export function getChangedPackages(
  cwd: string,
  previousVersions: Map<string, string>
): Package[] {
  const { packages } = getPackagesSync(cwd);
  const changedPackages = new Set<Package>();

  for (const pkg of packages) {
    const previousVersion = previousVersions.get(pkg.dir);
    if (previousVersion !== pkg.packageJson.version) {
      changedPackages.add(pkg);
    }
  }

  return Array.from(changedPackages.values());
}
