
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportCashCustomersReport } from "@/utils/reports/exportCashCustomersReport";
import { ReportButtonProps } from "./ReportsContainer";
import { useState } from "react";

export const CashSalesReport = ({ redirectToDocuments }: ReportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      console.log("Starting cash sales report export");
      await exportCashCustomersReport(redirectToDocuments);
      console.log("Finished cash sales report export");
    } catch (error) {
      console.error("Error in cash sales report export:", error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleExport}
      disabled={isExporting}
    >
      <FileSpreadsheet className="mr-2 h-5 w-5" />
      {isExporting ? "Izvoz u toku..." : "Izveštaj gotovinske prodaje"}
    </Button>
  );
};
