import { JsonPackage } from "./types";
import { Package } from "@manypkg/get-packages";
export declare function groupPackagesByPath(packages: JsonPackage[]): Map<string, string>;
export declare function getChangedPackages(cwd: string, previousVersions: Map<string, string>): Package[];
