
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportMonthlyCustomerReport } from "@/utils/reports/monthlyCustomerReport";
import { exportMonthlyItemsReport } from "@/utils/reports/monthlyItemsReport";

export const MonthlyReportButtons = () => {
  return (
    <>
      <Button
        variant="outline"
        className="w-full py-5 text-base font-medium border border-gray-200 hover:bg-accent/10 hover:text-accent hover:border-accent/20 transition-colors shadow-sm"
        onClick={() => exportMonthlyCustomerReport()}
      >
        <FileSpreadsheet className="mr-2 h-5 w-5 text-accent" />
        Mesečna prodaja po kupcima
      </Button>
      
      <Button
        variant="outline"
        className="w-full py-5 text-base font-medium border border-gray-200 hover:bg-accent/10 hover:text-accent hover:border-accent/20 transition-colors shadow-sm"
        onClick={() => exportMonthlyItemsReport()}
      >
        <FileSpreadsheet className="mr-2 h-5 w-5 text-accent" />
        Mesečna prodaja po artiklima
      </Button>
    </>
  );
};
