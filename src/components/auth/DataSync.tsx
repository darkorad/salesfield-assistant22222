import { Progress } from "@/components/ui/progress";

interface DataSyncProps {
  isSyncing: boolean;
  progress: number;
}

export const DataSync = ({ isSyncing, progress }: DataSyncProps) => {
  if (!isSyncing) return null;
  
  return (
    <div className="mb-4 space-y-2">
      <div className="text-sm text-gray-600 text-center">Syncing data...</div>
      <Progress value={progress} className="w-full" />
    </div>
  );
};