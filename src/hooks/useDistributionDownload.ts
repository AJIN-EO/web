import { useDownloadDistributionMutation } from "../queries/companyDistributions";
import type { PackageStatus } from "../types/api";

export function useDistributionDownload(publicId: string, packageStatus: PackageStatus | undefined) {
  const downloadMutation = useDownloadDistributionMutation(publicId);
  const canDownload = packageStatus === "ready" && !downloadMutation.isPending;

  const download = async () => {
    if (!canDownload) return;
    try {
      const { downloadUrl } = await downloadMutation.mutateAsync();
      window.location.assign(downloadUrl);
    } catch {
      // The mutation exposes the server error to the view.
    }
  };

  return {
    download,
    canDownload,
    isDownloading: downloadMutation.isPending,
    error: downloadMutation.error,
  };
}
