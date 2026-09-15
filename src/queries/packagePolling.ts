import type { PackageStatus } from "../types/api";

export const PACKAGE_POLLING_INTERVAL_MS = 10_000;

interface PackageStatusValue {
  package_status: PackageStatus;
}

export function isPackageProcessing(status: PackageStatus | undefined) {
  return status === "pending" || status === "processing";
}

export function hasProcessingPackage(requests: readonly PackageStatusValue[] | undefined) {
  return requests?.some((request) => isPackageProcessing(request.package_status)) ?? false;
}

export function packagePollingInterval(status: PackageStatus | undefined) {
  return isPackageProcessing(status) ? PACKAGE_POLLING_INTERVAL_MS : false;
}

export function packageListPollingInterval(requests: readonly PackageStatusValue[] | undefined) {
  return hasProcessingPackage(requests) ? PACKAGE_POLLING_INTERVAL_MS : false;
}
