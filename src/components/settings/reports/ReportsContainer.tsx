
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyReportButton } from "./DailyReportButton";
import { MonthlyReportButtons } from "./MonthlyReportButtons";
import { CashSalesReport } from "./CashSalesReport";

export const ReportsContainer = () => {
  return (
    <Card className="mx-auto max-w-lg shadow-lg">
      <CardHeader className="bg-accent/5 rounded-t-lg">
        <CardTitle className="text-xl md:text-2xl text-accent">Izvoz izveštaja</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <DailyReportButton />
        <MonthlyReportButtons />
        <CashSalesReport />
      </CardContent>
    </Card>
  );
};
