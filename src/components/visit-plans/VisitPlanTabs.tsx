
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Customer } from "@/types";
import { DaySchedule } from "./DaySchedule";
import { DayTabsList } from "./DayTabsList";
import { DAYS_OF_WEEK } from "./constants/days";
import { useCustomersByDay } from "./hooks/useCustomersByDay";

interface VisitPlanTabsProps {
  selectedDay: string;
  onDayChange: (day: string) => void;
  customers: Customer[];
}

export const VisitPlanTabs = ({ selectedDay, onDayChange, customers }: VisitPlanTabsProps) => {
  return (
    <div className="space-y-2">
      <Tabs defaultValue={selectedDay} onValueChange={onDayChange} className="w-full">
        <DayTabsList selectedDay={selectedDay} />

        {DAYS_OF_WEEK.map((day) => {
          const dayCustomers = useCustomersByDay(customers, day);
          
          return (
            <TabsContent key={day} value={day}>
              <DaySchedule 
                day={day} 
                customers={dayCustomers}
                onCustomerSelect={(customer) => {
                  // We don't need to do anything with the customer here now,
                  // since the DaySchedule component handles this internally
                }}
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
