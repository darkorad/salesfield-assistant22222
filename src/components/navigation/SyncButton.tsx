
import { Button } from "@/components/ui/button";
import { RefreshCw, WifiOff } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const SyncButton = () => {
  const { isOnline, isSyncing, syncData, formattedLastSync, hasLocalData } = useOfflineSync();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={syncData}
            disabled={isSyncing || !isOnline}
            className={`gap-2 ${!isOnline ? 'text-red-500' : ''}`}
          >
            {!isOnline ? (
              <WifiOff className="h-4 w-4" />
            ) : (
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            )}
            <span className="sr-only sm:not-sr-only sm:inline-block">
              {isSyncing ? "Sinhronizacija..." : "Sinhronizuj"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isOnline 
              ? `Status: Online • Poslednja sinhronizacija: ${formattedLastSync()}`
              : hasLocalData 
                ? "Status: Offline • Koriste se lokalni podaci"
                : "Status: Offline • Nema lokalnih podataka, potrebna je sinhronizacija"
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
