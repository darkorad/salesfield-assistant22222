import { Button } from "@/components/ui/button";
import { Eye, FileSpreadsheet } from "lucide-react";
import { generateDailyReport } from "@/utils/reports/dailyReportUtils";
import { generateMonthlyReport } from "@/utils/reports/monthlyReportUtils";
import { generateProductReport } from "@/utils/reports/productReportUtils";
import { exportDailySalesReport } from "@/utils/reports/exportDailySalesReport";

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
          onClick={() => generateMonthlyReport()}
        >
          Izvezi mesečnu prodaju
        </Button>
      </div>
      <div className="space-y-2">
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={() => generateProductReport()}
        >
          Izvezi prodaju po artiklima
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