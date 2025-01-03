import { Button } from "@/components/ui/button";
import { Eye, FileSpreadsheet } from "lucide-react";
import { generateDailyReport } from "@/utils/reports/dailyReportUtils";
import { exportDailySalesReport } from "@/utils/reports/exportDailySalesReport";
import { exportMonthlySalesReport } from "@/utils/reports/exportMonthlySalesReport";
import { exportCashCustomersReport } from "@/utils/reports/exportCashCustomersReport";

interface SalesReportButtonsProps {
  onPreview: (type: 'daily' | 'monthly' | 'products', data: any[]) => void;
}

export const SalesReportButtons = ({ onPreview }: SalesReportButtonsProps) => {
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
          className="w-full py-6 text-lg font-medium"
          onClick={() => exportMonthlySalesReport()}
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Izvezi mesečnu prodaju
        </Button>
      </div>
      <div className="space-y-2">
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={() => exportDailySalesReport()}
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Izvezi dnevnu prodaju
        </Button>
      </div>
      <div className="space-y-2">
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={() => exportCashCustomersReport()}
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Izvezi kupce za gotovinu
        </Button>
      </div>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full py-4"
          onClick={handlePreviewDaily}
        >
          <Eye className="mr-2 h-5 w-5" />
          Prikaži dnevnu prodaju
        </Button>
      </div>
    </>
  );
};