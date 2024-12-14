import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { generateDailyReport, generateMonthlyReport, generateProductReport } from "@/utils/report-utils";
import { SalesTable } from "../sales/SalesTable";
import { Order } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        <div className="border rounded-lg overflow-x-auto">
          {(previewData.type === 'daily' || previewData.type === 'monthly') && (
            <div className="max-w-[100vw] overflow-x-auto">
              <SalesTable sales={previewData.data as Order[]} sentOrderIds={[]} />
            </div>
          )}
          {previewData.type === 'products' && (
            <div className="max-w-[100vw] overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Proizvod</TableHead>
                    <TableHead className="whitespace-nowrap">Proizvođač</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Ukupna količina</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Ukupna vrednost (RSD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.data.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap">{item['Proizvod']}</TableCell>
                      <TableCell className="whitespace-nowrap">{item['Proizvođač']}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{item['Ukupna količina']}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{item['Ukupna vrednost (RSD)']}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Izveštaji</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
        {renderPreview()}
      </CardContent>
    </Card>
  );
};