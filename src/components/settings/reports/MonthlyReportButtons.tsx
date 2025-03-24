
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { exportMonthlySalesReport } from "@/utils/reports/exportMonthlySalesReport";
import { exportMonthlyCustomerReport } from "@/utils/reports/monthlyCustomerReport";
import { exportMonthlyItemsReport } from "@/utils/reports/monthlyItemsReport";
import { ReportButtonProps } from "./ReportsContainer";

export const MonthlyReportButtons = ({ redirectToDocuments }: ReportButtonProps) => {
  const [isExportingSales, setIsExportingSales] = useState(false);
  const [isExportingCustomers, setIsExportingCustomers] = useState(false);
  const [isExportingItems, setIsExportingItems] = useState(false);

  const handleExportSales = async () => {
    if (isExportingSales) return;
    
    setIsExportingSales(true);
    try {
      console.log("Starting monthly sales report export");
      await exportMonthlySalesReport(redirectToDocuments);
      console.log("Finished monthly sales report export");
    } catch (error) {
      console.error("Error in monthly sales report export:", error);
    } finally {
      setIsExportingSales(false);
    }
  };

  const handleExportCustomers = async () => {
    if (isExportingCustomers) return;
    
    setIsExportingCustomers(true);
    try {
      console.log("Starting monthly customer report export");
      await exportMonthlyCustomerReport(redirectToDocuments);
      console.log("Finished monthly customer report export");
    } catch (error) {
      console.error("Error in monthly customer report export:", error);
    } finally {
      setIsExportingCustomers(false);
    }
  };

  const handleExportItems = async () => {
    if (isExportingItems) return;
    
    setIsExportingItems(true);
    try {
      console.log("Starting monthly items report export");
      await exportMonthlyItemsReport(redirectToDocuments);
      console.log("Finished monthly items report export");
    } catch (error) {
      console.error("Error in monthly items report export:", error);
    } finally {
      setIsExportingItems(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full"
        onClick={handleExportSales}
        disabled={isExportingSales}
      >
        <FileSpreadsheet className="mr-2 h-5 w-5" />
        {isExportingSales ? "Izvoz u toku..." : "Mesečni izveštaj prodaje"}
      </Button>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={handleExportCustomers}
        disabled={isExportingCustomers}
      >
        <FileSpreadsheet className="mr-2 h-5 w-5" />
        {isExportingCustomers ? "Izvoz u toku..." : "Mesečni izveštaj po kupcima"}
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleExportItems}
        disabled={isExportingItems}
      >
        <FileSpreadsheet className="mr-2 h-5 w-5" />
        {isExportingItems ? "Izvoz u toku..." : "Mesečni izveštaj po artiklima"}
      </Button>
    </div>
  );
};
