
import React from "react";

interface DayScheduleInfoProps {
  day: string;
  customersCount: number;
}

export const DayScheduleInfo = ({ day, customersCount }: DayScheduleInfoProps) => {
  if (customersCount === 0) {
    return null;
  }
  
  return (
    <div className="p-2 bg-amber-50 rounded text-xs border border-amber-200 mb-2">
      Prikazuje se {customersCount} kupaca za {day}
    </div>
  );
};
