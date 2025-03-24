
import { Button } from "@/components/ui/button";
import { Eye, FileSpreadsheet } from "lucide-react";
import { generateDailyReport } from "@/utils/reports/dailyReportUtils";
import { exportDailySalesReport } from "@/utils/reports/exportDailySalesReport";
import { exportMonthlySalesReport } from "@/utils/reports/exportMonthlySalesReport";
import { exportCashCustomersReport } from "@/utils/reports/exportCashCustomersReport";
import { useNavigate } from "react-router-dom";
import { createRedirectToDocuments } from "@/utils/fileExport";

interface SalesReportButtonsProps {
  onPreview: (type: 'daily' | 'monthly' | 'products', data: any[]) => void;
}

export const SalesReportButtons = ({ onPreview }: SalesReportButtonsProps) => {
  const navigate = useNavigate();
  const redirectToDocuments = createRedirectToDocuments(navigate);
  
  const handlePreviewDaily = async () => {
    const data = await generateDailyReport();
    if (data) {
      onPreview('daily', data);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Button
          className="w-full py-4 text-base"
          onClick={() => exportMonthlySalesReport(redirectToDocuments)}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Izvezi mesečnu prodaju
        </Button>
      </div>
      <div className="space-y-2">
        <Button
          className="w-full py-4 text-base"
          onClick={() => exportDailySalesReport(redirectToDocuments)}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Izvezi dnevnu prodaju
        </Button>
      </div>
      <div className="space-y-2">
        <Button
          className="w-full py-4 text-base"
          onClick={() => exportCashCustomersReport(redirectToDocuments)}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Izvezi kupce za gotovinu
        </Button>
      </div>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full py-3 text-base"
          onClick={handlePreviewDaily}
        >
          <Eye className="mr-2 h-4 w-4" />
          Prikaži dnevnu prodaju
        </Button>
      </div>
    </>
  );
};
