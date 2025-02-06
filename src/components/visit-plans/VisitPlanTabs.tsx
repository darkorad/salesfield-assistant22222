import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer } from "@/types";
import { DaySchedule } from "./DaySchedule";

interface VisitPlanTabsProps {
  selectedDay: string;
  onDayChange: (day: string) => void;
  customers: Customer[];
}

const DAYS_OF_WEEK = [
  "Ponedeljak",
  "Utorak",
  "Sreda",
  "Četvrtak",
  "Petak",
  "Subota",
  "Nedelja"
];

export const VisitPlanTabs = ({ selectedDay, onDayChange, customers }: VisitPlanTabsProps) => {
  const getDayCustomers = (day: string) => {
    return customers.filter(customer => {
      const customerDay = customer.dan_obilaska?.toLowerCase().trim();
      const searchDay = day.toLowerCase().trim();
      return customerDay === searchDay;
    });
  };

  return (
    <Tabs defaultValue={selectedDay} onValueChange={onDayChange} className="w-full">
      <TabsList className="w-full flex flex-wrap gap-1 justify-start mb-6">
        {DAYS_OF_WEEK.map((day) => (
          <TabsTrigger 
            key={day} 
            value={day.toLowerCase()}
            className="flex-1 min-w-0 px-2"
          >
            {day}
          </TabsTrigger>
        ))}
      </TabsList>

      {DAYS_OF_WEEK.map((day) => (
        <TabsContent key={day} value={day.toLowerCase()}>
          <DaySchedule day={day} customers={getDayCustomers(day)} />
        </TabsContent>
      ))}
    </Tabs>
  );
};