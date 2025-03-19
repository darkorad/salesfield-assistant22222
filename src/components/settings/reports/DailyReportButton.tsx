
import { Button } from "@/components/ui/button";
import { exportDailyDetailedReport } from "@/utils/reports/dailyDetailedReport";
import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";

export const DailyReportButton = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportDailyDetailedReport();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className="w-full py-6 text-lg font-medium"
    >
      <FileSpreadsheet className="mr-2 h-5 w-5" />
      {isExporting ? "Izvoz u toku..." : "Detaljan dnevni izveštaj"}
    </Button>
  );
};
