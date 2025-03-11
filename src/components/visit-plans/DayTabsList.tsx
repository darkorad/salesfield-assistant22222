
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FIRST_ROW, SECOND_ROW } from "./constants/days";

interface DayTabsListProps {
  selectedDay: string;
}

export const DayTabsList: React.FC<DayTabsListProps> = ({ selectedDay }) => {
  return (
    <div className="space-y-1">
      {/* First row of days */}
      <TabsList className="w-full flex gap-1 justify-start">
        {FIRST_ROW.map((day) => (
          <TabsTrigger 
            key={day} 
            value={day}
            className="flex-1 min-w-0 px-1 py-0.5 text-[11px] sm:text-xs capitalize"
          >
            {day}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {/* Second row of days */}
      <TabsList className="w-full flex gap-1 justify-start">
        {SECOND_ROW.map((day) => (
          <TabsTrigger 
            key={day} 
            value={day}
            className="flex-1 min-w-0 px-1 py-0.5 text-[11px] sm:text-xs capitalize"
          >
            {day}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};
