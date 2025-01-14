import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PreviewTable } from "../reports/PreviewTable";
import { SalesReportButtons } from "../reports/SalesReportButtons";
import { Button } from "../ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportDailyDetailedReport } from "@/utils/reports/dailyDetailedReport";
import { exportMonthlyCustomerReport } from "@/utils/reports/monthlyCustomerReport";
import { exportMonthlyItemsReport } from "@/utils/reports/monthlyItemsReport";

export const Reports = () => {
  const [previewData, setPreviewData] = useState<{
    type: 'daily' | 'monthly' | 'products' | null;
    data: any[];
  }>({ type: null, data: [] });

  const handlePreview = (type: 'daily' | 'monthly' | 'products', data: any[]) => {
    setPreviewData({ type, data });
  };

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Izveštaji</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Button
            className="w-full py-6 text-lg font-medium"
            onClick={() => exportDailyDetailedReport()}
          >
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Detaljan dnevni izveštaj
          </Button>
          
          <Button
            className="w-full py-6 text-lg font-medium"
            onClick={() => exportMonthlyCustomerReport()}
          >
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Mesečna prodaja po kupcima
          </Button>
          
          <Button
            className="w-full py-6 text-lg font-medium"
            onClick={() => exportMonthlyItemsReport()}
          >
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Mesečna prodaja po artiklima
          </Button>
        </div>
        
        <SalesReportButtons onPreview={handlePreview} />
        <PreviewTable type={previewData.type} data={previewData.data} />
      </CardContent>
    </Card>
  );
};