
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportMonthlyCustomerReport } from "@/utils/reports/monthlyCustomerReport";
import { exportMonthlyItemsReport } from "@/utils/reports/monthlyItemsReport";

export const MonthlyReportButtons = () => {
  return (
    <>
      <Button
        variant="outline"
        className="w-full py-4 text-sm md:text-base font-medium border border-gray-200 hover:bg-accent/10 hover:text-accent hover:border-accent/20 transition-colors shadow-sm"
        onClick={() => exportMonthlyCustomerReport()}
      >
        <FileSpreadsheet className="mr-2 h-4 w-4 md:h-5 md:w-5 text-accent" />
        Mesečna prodaja po kupcima
      </Button>
      
      <Button
        variant="outline"
        className="w-full py-4 text-sm md:text-base font-medium border border-gray-200 hover:bg-accent/10 hover:text-accent hover:border-accent/20 transition-colors shadow-sm"
        onClick={() => exportMonthlyItemsReport()}
      >
        <FileSpreadsheet className="mr-2 h-4 w-4 md:h-5 md:w-5 text-accent" />
        Mesečna prodaja po artiklima
      </Button>

      <div className="mt-6 border-t pt-5">
        <h3 className="text-base font-medium mb-4">Export keš kupovina</h3>
      </div>
    </>
  );
};
