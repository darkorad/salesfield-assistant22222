import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PreviewTable } from "../reports/PreviewTable";
import { SalesReportButtons } from "../reports/SalesReportButtons";

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
        <SalesReportButtons onPreview={handlePreview} />
        <PreviewTable type={previewData.type} data={previewData.data} />
      </CardContent>
    </Card>
  );
};