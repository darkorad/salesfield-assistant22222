
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportMonthlyCustomerReport } from "@/utils/reports/monthlyCustomerReport";
import { exportMonthlyItemsReport } from "@/utils/reports/monthlyItemsReport";

export const MonthlyReportButtons = () => {
  return (
    <>
      <Button
        className="w-full py-6 text-lg font-medium"
        onClick={() => exportMonthlyCustomerReport()}
      >
        <FileSpreadsheet className="mr-2 h-5 w-5" />
        Mesečna prodaja po kupcima
      </Button>
      
      <Button
        className="w-full py-6 text-lg font-medium"
        onClick={() => exportMonthlyItemsReport()}
      >
        <FileSpreadsheet className="mr-2 h-5 w-5" />
        Mesečna prodaja po artiklima
      </Button>
    </>
  );
};
