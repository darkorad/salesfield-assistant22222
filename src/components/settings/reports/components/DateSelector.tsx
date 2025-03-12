
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateSelectorProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export const DateSelector = ({ selectedDate, onDateChange }: DateSelectorProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline"
          className={cn(
            "w-full justify-start text-left text-sm md:text-base font-normal",
            "border-dashed border-input",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "dd.MM.yyyy")
          ) : (
            <span>Izaberite datum</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            onDateChange(date);
            setIsCalendarOpen(false);
          }}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
};
