
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyReportButton } from "./DailyReportButton";
import { MonthlyReportButtons } from "./MonthlyReportButtons";
import { CashSalesReport } from "./CashSalesReport";
import { Info } from "lucide-react";

export const ReportsContainer = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Dnevni izveštaji
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm bg-muted/30 p-3 rounded-md flex gap-2">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p>
              Svi izveštaji se automatski čuvaju u Download folder na vašem uređaju. 
              Možete ih pronaći u aplikaciji Files ili My Files.
            </p>
          </div>
          <DailyReportButton />
          <CashSalesReport />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mesečni izveštaji</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <MonthlyReportButtons />
        </CardContent>
      </Card>
    </div>
  );
};
