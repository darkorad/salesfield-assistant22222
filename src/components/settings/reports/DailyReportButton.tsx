
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportDailyDetailedReport } from "@/utils/reports/dailyDetailedReport";
import { useState } from "react";
import { toast } from "sonner";

export const DailyReportButton = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      await exportDailyDetailedReport();
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(`Izvoz nije uspeo: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full py-4 text-sm md:text-base font-medium border border-gray-200 hover:bg-accent/10 hover:text-accent hover:border-accent/20 transition-colors shadow-sm"
      onClick={handleExport}
      disabled={isExporting}
    >
      <FileSpreadsheet className="mr-2 h-4 w-4 md:h-5 md:w-5 text-accent" />
      {isExporting ? "Izvoz u toku..." : "Detaljan dnevni izveštaj"}
    </Button>
  );
};
