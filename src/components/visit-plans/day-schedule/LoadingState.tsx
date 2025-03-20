
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  isOffline?: boolean;
}

export const LoadingState = ({ isOffline }: LoadingStateProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 py-4">
      <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-4">
        <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
        <span className="text-sm">
          {isOffline ? "Učitavanje iz lokalne baze..." : "Učitavanje..."}
        </span>
      </div>
    </div>
  );
};
