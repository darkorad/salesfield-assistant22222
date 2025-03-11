
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportDailyDetailedReport } from "@/utils/reports/dailyDetailedReport";

export const DailyReportButton = () => {
  return (
    <Button
      className="w-full py-6 text-lg font-medium"
      onClick={() => exportDailyDetailedReport()}
    >
      <FileSpreadsheet className="mr-2 h-5 w-5" />
      Detaljan dnevni izveštaj
    </Button>
  );
};
