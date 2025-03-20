
import React from "react";
import { WifiOff } from "lucide-react";

interface DayScheduleInfoProps {
  day: string;
  customersCount: number;
  isOffline?: boolean;
}

export const DayScheduleInfo = ({ day, customersCount, isOffline }: DayScheduleInfoProps) => {
  if (customersCount === 0) {
    return null;
  }
  
  return (
    <div className={`p-3 rounded text-sm flex items-center ${isOffline ? 'bg-blue-50 border border-blue-200' : 'bg-amber-50 border border-amber-200'}`}>
      {isOffline && (
        <div className="mr-2 flex items-center">
          <WifiOff className="h-4 w-4 mr-1 text-blue-600" />
          <span className="font-medium text-blue-600">Offline</span>
          <span className="mx-1">•</span>
        </div>
      )}
      <span>
        Prikazuje se {customersCount} kupaca za {day}
      </span>
    </div>
  );
};
