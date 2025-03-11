
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportDailyDetailedReport } from "@/utils/reports/dailyDetailedReport";

export const DailyReportButton = () => {
  return (
    <Button
      variant="outline"
      className="w-full py-4 text-sm md:text-base font-medium border border-gray-200 hover:bg-accent/10 hover:text-accent hover:border-accent/20 transition-colors shadow-sm"
      onClick={() => exportDailyDetailedReport()}
    >
      <FileSpreadsheet className="mr-2 h-4 w-4 md:h-5 md:w-5 text-accent" />
      Detaljan dnevni izveštaj
    </Button>
  );
};
