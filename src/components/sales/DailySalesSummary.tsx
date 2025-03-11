
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "./daily/LoadingState";
import { SalesTableSection } from "./daily/SalesTableSection";
import { TotalsSummary } from "./daily/TotalsSummary";
import { useDailySales } from "./daily/useDailySales";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DailySalesSummary = () => {
  const { todaySales, isLoading } = useDailySales();

  // Split sales into cash and invoice sales
  const cashSales = todaySales.filter(sale => sale.payment_status === 'gotovina');
  const invoiceSales = todaySales.filter(sale => sale.payment_status === 'racun');

  return (
    <Card className="mt-4 md:mt-6 shadow-md">
      <CardHeader className="bg-accent/5 rounded-t-lg">
        <CardTitle className="text-lg md:text-xl text-accent">Današnje porudžbine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">Sve</TabsTrigger>
                  <TabsTrigger value="cash">Gotovina</TabsTrigger>
                  <TabsTrigger value="invoice">Račun</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 animate-fade-in">
                  <SalesTableSection sales={todaySales} />
                  {todaySales.length > 0 && <TotalsSummary sales={todaySales} />}
                </TabsContent>

                <TabsContent value="cash" className="space-y-4 animate-fade-in">
                  <SalesTableSection sales={cashSales} />
                  {cashSales.length > 0 && <TotalsSummary sales={cashSales} />}
                </TabsContent>

                <TabsContent value="invoice" className="space-y-4 animate-fade-in">
                  <SalesTableSection sales={invoiceSales} />
                  {invoiceSales.length > 0 && <TotalsSummary sales={invoiceSales} />}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySalesSummary;
