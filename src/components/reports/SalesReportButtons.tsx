import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { generateDailyReport, generateMonthlyReport, generateProductReport } from "@/utils/report-utils";

interface SalesReportButtonsProps {
  onPreview: (type: 'daily' | 'monthly' | 'products', data: any[]) => void;
}

export const SalesReportButtons = ({ onPreview }: SalesReportButtonsProps) => {
  const handlePreviewDaily = () => {
    const data = generateDailyReport(true);
    if (data) {
      onPreview('daily', data);
    }
  };

  const handlePreviewMonthly = () => {
    const data = generateMonthlyReport(true);
    if (data) {
      onPreview('monthly', data);
    }
  };

  const handlePreviewProducts = () => {
    const data = generateProductReport(true);
    if (data) {
      onPreview('products', data);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={() => generateDailyReport()}
        >
          Izvezi dnevni izveštaj prodaje
        </Button>
        <Button
          variant="outline"
          className="w-full py-4"
          onClick={handlePreviewDaily}
        >
          <Eye className="mr-2 h-5 w-5" />
          Prikaži dnevni izveštaj
        </Button>
      </div>
      <div className="space-y-2">
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={() => generateMonthlyReport()}
        >
          Izvezi mesečni izveštaj prodaje
        </Button>
        <Button
          variant="outline"
          className="w-full py-4"
          onClick={handlePreviewMonthly}
        >
          <Eye className="mr-2 h-5 w-5" />
          Prikaži mesečni izveštaj
        </Button>
      </div>
      <div className="space-y-2">
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={() => generateProductReport()}
        >
          Izvezi mesečni pregled proizvoda
        </Button>
        <Button
          variant="outline"
          className="w-full py-4"
          onClick={handlePreviewProducts}
        >
          <Eye className="mr-2 h-5 w-5" />
          Prikaži pregled proizvoda
        </Button>
      </div>
    </>
  );
};