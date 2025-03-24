
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportDailyDetailedReport } from "@/utils/reports/dailyDetailedReport";
import { ReportButtonProps } from "./ReportsContainer";
import { useState } from "react";

export const DailyReportButton = ({ redirectToDocuments }: ReportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      console.log("Starting daily report export");
      await exportDailyDetailedReport(redirectToDocuments);
      console.log("Finished daily report export");
    } catch (error) {
      console.error("Error in daily report export:", error);
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
      {isExporting ? "Izvoz u toku..." : "Dnevni detaljan izveštaj"}
    </Button>
  );
};
