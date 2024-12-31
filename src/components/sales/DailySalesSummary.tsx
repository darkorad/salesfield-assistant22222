import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types";
import { SalesTable } from "./SalesTable";
import { SalesActions } from "./SalesActions";
import { SyncDataButton } from "./SyncDataButton";
import { supabase } from "@/integrations/supabase/client";

interface Contact {
  name: string;
  viber: string;
}

const DailySalesSummary = () => {
  const [todaySales, setTodaySales] = useState<Order[]>([]);
  const [sentOrderIds, setSentOrderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("sentOrders");
    return saved ? JSON.parse(saved) : [];
  });
  const [contacts, setContacts] = useState<{
    email: string;
    contacts: Contact[];
  }>(() => {
    const saved = localStorage.getItem("contactSettings");
    return saved
      ? JSON.parse(saved)
      : {
          email: "",
          contacts: [
            { name: "ACA", viber: "" },
            { name: "PERA", viber: "" },
          ],
        };
  });

  const loadTodaySales = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get today's date at start of day in local timezone
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get tomorrow's date at start of day in local timezone
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log("Fetching sales between:", today.toISOString(), "and", tomorrow.toISOString());

      const { data: salesData, error } = await supabase
        .from('sales')
        .select('*, customer:customers(*)')
        .eq('user_id', session.user.id)
        .gte('date', today.toISOString())
        .lt('date', tomorrow.toISOString())
        .order('date', { ascending: false });

      if (error) {
        console.error("Error loading sales:", error);
        return;
      }

      console.log("Fetched sales data:", salesData);
      setTodaySales(salesData || []);
    } catch (error) {
      console.error("Error loading sales:", error);
    }
  };

  useEffect(() => {
    loadTodaySales();
    const interval = setInterval(loadTodaySales, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOrdersSent = (newSentOrderIds: string[]) => {
    const updatedSentOrders = [...sentOrderIds, ...newSentOrderIds];
    setSentOrderIds(updatedSentOrders);
    localStorage.setItem("sentOrders", JSON.stringify(updatedSentOrders));
  };

  const unsentSales = todaySales.filter(sale => !sentOrderIds.includes(sale.id));
  const totalSales = unsentSales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <Card className="mt-4 md:mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg md:text-xl">Današnje porudžbine</CardTitle>
        <SyncDataButton onSyncComplete={loadTodaySales} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="min-w-full inline-block align-middle">
              <SalesTable sales={todaySales} sentOrderIds={sentOrderIds} />
            </div>
          </div>
          {todaySales.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm md:text-base font-medium">Ukupno za danas:</span>
                <span className="font-bold text-base md:text-lg">{totalSales} RSD</span>
              </div>
            </div>
          )}
          <SalesActions 
            contacts={contacts} 
            sales={unsentSales}
            onOrdersSent={handleOrdersSent} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySalesSummary;