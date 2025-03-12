
import { Button } from "@/components/ui/button";
import { exportDailyDetailedReport } from "@/utils/reports/daily-detailed";
import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const DailyReportButton = () => {
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportDailyDetailedReport(() => navigate('/documents'));
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
      Izvezi današnji izveštaj
    </Button>
  );
};
