
import React from "react";
import { NetworkStatus } from "@/hooks/useConnectionStatus";

interface NetworkStatusIndicatorProps {
  status: NetworkStatus;
}

export const NetworkStatusIndicator = ({ status }: NetworkStatusIndicatorProps) => {
  return (
    <div className="mt-2 text-center">
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        status === 'online' ? 'bg-green-100 text-green-800' : 
        status === 'offline' ? 'bg-red-100 text-red-800' : 
        'bg-yellow-100 text-yellow-800'
      }`}>
        {status === 'online' ? '✓ Online' : 
         status === 'offline' ? '✗ Offline' : 
         '⟳ Provera konekcije...'}
      </span>
    </div>
  );
};
