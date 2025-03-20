
import React from "react";

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
    <div className={`p-2 rounded text-xs border mb-2 ${isOffline ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
      {isOffline && <span className="font-medium text-blue-600 mr-1">Offline:</span>}
      Prikazuje se {customersCount} kupaca za {day}
    </div>
  );
};
