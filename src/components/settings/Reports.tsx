import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { generateDailyReport, generateMonthlyReport, generateProductReport } from "@/utils/report-utils";
import { SalesTable } from "../sales/SalesTable";
import { Order } from "@/types";

export const Reports = () => {
  const [previewData, setPreviewData] = useState<{
    type: 'daily' | 'monthly' | 'products' | null;
    data: any[];
  }>({ type: null, data: [] });

  const handlePreviewDaily = () => {
    const data = generateDailyReport(true);
    if (data) {
      setPreviewData({ type: 'daily', data });
    }
  };

  const handlePreviewMonthly = () => {
    const data = generateMonthlyReport(true);
    if (data) {
      setPreviewData({ type: 'monthly', data });
    }
  };

  const handlePreviewProducts = () => {
    const data = generateProductReport(true);
    if (data) {
      setPreviewData({ type: 'products', data });
    }
  };

  const renderPreview = () => {
    if (!previewData.type) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">
          {previewData.type === 'daily' && "Dnevni izveštaj"}
          {previewData.type === 'monthly' && "Mesečni izveštaj"}
          {previewData.type === 'products' && "Pregled proizvoda"}
        </h3>
        <div className="border rounded-lg">
          {(previewData.type === 'daily' || previewData.type === 'monthly') && (
            <SalesTable sales={previewData.data as Order[]} sentOrderIds={[]} />
          )}
          {previewData.type === 'products' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proizvod</TableHead>
                  <TableHead>Proizvođač</TableHead>
                  <TableHead className="text-right">Ukupna količina</TableHead>
                  <TableHead className="text-right">Ukupna vrednost (RSD)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.data.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{item['Proizvod']}</TableCell>
                    <TableCell>{item['Proizvođač']}</TableCell>
                    <TableCell className="text-right">{item['Ukupna količina']}</TableCell>
                    <TableCell className="text-right">{item['Ukupna vrednost (RSD)']}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Izveštaji</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={generateDailyReport}
          >
            Izvezi dnevni izveštaj prodaje
          </Button>
          <Button
            variant="outline"
            onClick={handlePreviewDaily}
          >
            <Eye className="mr-2" />
            Prikaži
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={generateMonthlyReport}
          >
            Izvezi mesečni izveštaj prodaje
          </Button>
          <Button
            variant="outline"
            onClick={handlePreviewMonthly}
          >
            <Eye className="mr-2" />
            Prikaži
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={generateProductReport}
          >
            Izvezi mesečni pregled proizvoda
          </Button>
          <Button
            variant="outline"
            onClick={handlePreviewProducts}
          >
            <Eye className="mr-2" />
            Prikaži
          </Button>
        </div>
        {renderPreview()}
      </CardContent>
    </Card>
  );
};