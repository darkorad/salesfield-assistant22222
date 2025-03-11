
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MonthlySales = () => {
  const [monthlySales, setMonthlySales] = useState({
    totalCash: 0,
    totalInvoice: 0,
    total: 0
  });
  const [lastDataRefresh, setLastDataRefresh] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Check if there was a recent data import
        const userId = session.user.id;
        const lastImport = localStorage.getItem(`lastCustomersImport_${userId}`);
        setLastDataRefresh(lastImport);

        // Get first day of current month
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        firstDay.setHours(0, 0, 0, 0);

        // Get first day of next month
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        lastDay.setHours(0, 0, 0, 0);

        // Fetch sales data with proper date filtering
        const { data: salesData, error } = await supabase
          .from('sales')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('created_at', firstDay.toISOString())
          .lt('created_at', lastDay.toISOString());

        if (error) {
          console.error("Error loading sales:", error);
          return;
        }

        // If no sales data or empty array, set all values to 0
        if (!salesData || salesData.length === 0) {
          setMonthlySales({
            totalCash: 0,
            totalInvoice: 0,
            total: 0
          });
          return;
        }

        const cashSales = salesData.filter(sale => sale.payment_type === 'cash') || [];
        const invoiceSales = salesData.filter(sale => sale.payment_type === 'invoice') || [];

        setMonthlySales({
          totalCash: cashSales.reduce((sum, sale) => sum + (sale.total || 0), 0),
          totalInvoice: invoiceSales.reduce((sum, sale) => sum + (sale.total || 0), 0),
          total: salesData.reduce((sum, sale) => sum + (sale.total || 0), 0)
        });

      } catch (error) {
        console.error("Error:", error);
        setMonthlySales({
          totalCash: 0,
          totalInvoice: 0,
          total: 0
        });
      }
    };

    fetchMonthlySales();
    const interval = setInterval(fetchMonthlySales, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="mt-4 md:mt-6">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Mesečna prodaja</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lastDataRefresh && (
            <div className="text-xs text-muted-foreground">
              Poslednji uvoz podataka: {new Date(lastDataRefresh).toLocaleString('sr-Latn-RS')}
            </div>
          )}
          <div className="pt-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Gotovina:</span>
              <span className="font-bold">{monthlySales.totalCash} RSD</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Račun:</span>
              <span className="font-bold">{monthlySales.totalInvoice} RSD</span>
            </div>
            <div className="flex justify-between items-center text-base pt-2 border-t">
              <span className="font-medium">Ukupno za mesec:</span>
              <span className="font-bold">{monthlySales.total} RSD</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlySales;
