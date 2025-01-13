import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types";
import { SalesTable } from "./SalesTable";
import { SyncDataButton } from "./SyncDataButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DailySalesSummary = () => {
  const [todaySales, setTodaySales] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTodaySales = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      // Get today's date at start of day in local timezone
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get tomorrow's date at start of day in local timezone
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log("Fetching sales between:", today.toISOString(), "and", tomorrow.toISOString());

      const { data: salesData, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(*),
          darko_customer:kupci_darko(*)
        `)
        .eq('user_id', session.user.id)
        .gte('date', today.toISOString())
        .lt('date', tomorrow.toISOString())
        .order('date', { ascending: false });

      if (error) {
        console.error("Error loading sales:", error);
        toast.error("Greška pri učitavanju prodaje");
        return;
      }

      // Transform the data to use either regular customer or darko_customer
      const transformedSales = salesData?.map(sale => ({
        ...sale,
        customer: sale.customer || sale.darko_customer
      }));

      console.log("Fetched sales data:", transformedSales);
      setTodaySales(transformedSales || []);
    } catch (error) {
      console.error("Error loading sales:", error);
      toast.error("Greška pri učitavanju prodaje");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodaySales();
    const interval = setInterval(loadTodaySales, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const cashSales = todaySales.filter(sale => sale.payment_type === 'cash');
  const invoiceSales = todaySales.filter(sale => sale.payment_type === 'invoice');
  const totalCash = cashSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalInvoice = invoiceSales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <Card className="mt-4 md:mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg md:text-xl">Današnje porudžbine</CardTitle>
        <SyncDataButton onSyncComplete={loadTodaySales} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Učitavanje...</p>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="min-w-full inline-block align-middle">
                  <SalesTable sales={todaySales} sentOrderIds={[]} />
                </div>
              </div>
              {todaySales.length > 0 && (
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Gotovina:</span>
                    <span className="font-bold">{totalCash} RSD</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Račun:</span>
                    <span className="font-bold">{totalInvoice} RSD</span>
                  </div>
                  <div className="flex justify-between items-center text-base pt-2 border-t">
                    <span className="font-medium">Ukupno za danas:</span>
                    <span className="font-bold">{totalSales} RSD</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySalesSummary;