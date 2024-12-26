import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types";
import { SalesTable } from "./SalesTable";
import { SalesActions } from "./SalesActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sales, error } = await supabase
        .from('sales')
        .select(`
          id,
          total,
          date,
          items,
          payment_type,
          user_id,
          customers (
            id,
            name,
            address,
            city,
            phone,
            pib,
            is_vat_registered,
            code,
            user_id
          )
        `)
        .eq('user_id', user.id)
        .gte('date', today.toISOString())
        .order('date', { ascending: false });

      if (error) {
        console.error("Error loading sales:", error);
        toast.error("Greška pri učitavanju prodaje");
        return;
      }

      console.log("Loaded sales:", sales);
      
      const formattedSales: Order[] = (sales?.map(sale => ({
        id: sale.id,
        customer: sale.customers, // customers is already a single object from the join
        items: sale.items,
        total: sale.total,
        date: sale.date,
        paymentType: sale.payment_type,
        userId: sale.user_id
      })) || []);

      setTodaySales(formattedSales);
    } catch (error) {
      console.error("Error loading sales:", error);
      toast.error("Greška pri učitavanju prodaje");
    }
  };

  useEffect(() => {
    loadTodaySales();
    const interval = setInterval(loadTodaySales, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleOrdersSent = (newSentOrderIds: string[]) => {
    const updatedSentOrders = [...sentOrderIds, ...newSentOrderIds];
    setSentOrderIds(updatedSentOrders);
    localStorage.setItem("sentOrders", JSON.stringify(updatedSentOrders));
  };

  return (
    <Card className="mt-4 md:mt-8">
      <CardHeader>
        <CardTitle>Današnje porudžbine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <SalesTable sales={todaySales} sentOrderIds={sentOrderIds} />
          {todaySales.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium text-lg">Ukupno za danas:</span>
                <span className="font-bold text-lg">
                  {todaySales.reduce((sum, sale) => sum + sale.total, 0)} RSD
                </span>
              </div>
            </div>
          )}
          <SalesActions 
            contacts={contacts} 
            sales={todaySales.filter(sale => !sentOrderIds.includes(sale.id))}
            onOrdersSent={handleOrdersSent} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySalesSummary;