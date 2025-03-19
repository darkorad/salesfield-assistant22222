
import { Button } from "@/components/ui/button";
import { exportMonthlyCustomerReport } from "@/utils/reports/monthlyCustomerReport";
import { exportMonthlyItemsReport } from "@/utils/reports/monthlyItemsReport";
import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";

export const MonthlyReportButtons = () => {
  const [isExportingCustomer, setIsExportingCustomer] = useState(false);
  const [isExportingItems, setIsExportingItems] = useState(false);

  const handleExportCustomerReport = async () => {
    try {
      setIsExportingCustomer(true);
      await exportMonthlyCustomerReport();
    } finally {
      setIsExportingCustomer(false);
    }
  };

  const handleExportItemsReport = async () => {
    try {
      setIsExportingItems(true);
      await exportMonthlyItemsReport();
    } finally {
      setIsExportingItems(false);
    }
  };

  return (
    <>
      <Button
        className="w-full py-6 text-lg font-medium"
        onClick={handleExportCustomerReport}
        disabled={isExportingCustomer}
      >
        <FileSpreadsheet className="mr-2 h-5 w-5" />
        {isExportingCustomer ? "Izvoz u toku..." : "Mesečna prodaja po kupcima"}
      </Button>
      
      <Button
        className="w-full py-6 text-lg font-medium"
        onClick={handleExportItemsReport}
        disabled={isExportingItems}
      >
        <FileSpreadsheet className="mr-2 h-5 w-5" />
        {isExportingItems ? "Izvoz u toku..." : "Mesečna prodaja po artiklima"}
      </Button>
    </>
  );
};
