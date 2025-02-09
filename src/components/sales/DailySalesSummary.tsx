
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDailySales } from "./daily/useDailySales";
import { LoadingState } from "./daily/LoadingState";
import { startOfDay, endOfDay } from "date-fns";

interface DailySalesSummaryProps {
  selectedDate: Date;
}

export const DailySalesSummary = ({ selectedDate }: DailySalesSummaryProps) => {
  const { todaySales, isLoading } = useDailySales(selectedDate);

  if (isLoading) {
    return <LoadingState />;
  }

  const totalSales = todaySales.reduce((acc, sale) => acc + sale.total, 0);
  const cashSales = todaySales
    .filter(sale => sale.payment_type === 'cash')
    .reduce((acc, sale) => acc + sale.total, 0);
  const invoiceSales = todaySales
    .filter(sale => sale.payment_type === 'invoice')
    .reduce((acc, sale) => acc + sale.total, 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ukupna prodaja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSales.toFixed(2)} RSD</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gotovina</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cashSales.toFixed(2)} RSD</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Račun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{invoiceSales.toFixed(2)} RSD</div>
        </CardContent>
      </Card>
    </div>
  );
};
