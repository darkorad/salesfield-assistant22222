
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateCashSalesReport } from "@/utils/reports/cashSales/reportGenerator";
import { fetchCashSalesForDate, filterCashSales, formatCashSalesForReport } from "@/services/cashSalesService";
import { createRedirectToDocuments } from "@/utils/fileExport";

export const CashSalesReport = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const redirectToDocuments = createRedirectToDocuments(navigate);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      // Fetch all sales for the selected date
      const salesData = await fetchCashSalesForDate(date);
      if (!salesData || salesData.length === 0) {
        setIsGenerating(false);
        return;
      }
      
      // Filter for cash sales only
      const cashSales = filterCashSales(salesData);
      if (cashSales.length === 0) {
        setIsGenerating(false);
        return;
      }
      
      // Format data for the report
      const formattedSales = formatCashSalesForReport(cashSales);
      
      // Generate the report
      await generateCashSalesReport(formattedSales, date, redirectToDocuments);
    } catch (error) {
      console.error("Error generating cash sales report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-md border">
      <h3 className="text-lg font-medium">Izveštaj gotovinske prodaje</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal w-full sm:w-auto",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd.MM.yyyy") : <span>Izaberi datum</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="w-full sm:w-auto"
        >
          {isGenerating ? "Generisanje..." : "Generiši izveštaj"}
        </Button>
      </div>
    </div>
  );
};
