
import React from "react";

interface LoadingStateProps {
  isOffline?: boolean;
}

export const LoadingState = ({ isOffline }: LoadingStateProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      <div className="col-span-full text-center text-gray-500 py-2 text-xs">
        {isOffline ? "Učitavanje iz lokalne baze..." : "Učitavanje..."}
      </div>
    </div>
  );
};
