import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportDailyDetailedReport } from "@/utils/reports/dailyDetailedReport";
import { exportMonthlyCustomerReport } from "@/utils/reports/monthlyCustomerReport";
import { exportMonthlyItemsReport } from "@/utils/reports/monthlyItemsReport";

export const Reports = () => {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Izvoz izveštaja</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  );
};