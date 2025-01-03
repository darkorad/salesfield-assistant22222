import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ViberButton } from "../sales/ViberButton";
import { EmailButton } from "../sales/EmailButton";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types";

export const CommunicationButtons = () => {
  const [todaySales, setTodaySales] = useState<Order[]>([]);
  const [sentOrderIds, setSentOrderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("sentOrders");
    return saved ? JSON.parse(saved) : [];
  });
  const [contacts, setContacts] = useState<{
    email: string;
    contacts: { name: string; viber: string; }[];
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

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slanje izveštaja</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {contacts.contacts.map((contact) => (
            <ViberButton
              key={contact.name}
              contact={contact}
              sales={unsentSales}
              onOrdersSent={handleOrdersSent}
            />
          ))}
          <EmailButton
            email={contacts.email}
            sales={unsentSales}
            onOrdersSent={handleOrdersSent}
          />
        </div>
      </CardContent>
    </Card>
  );
};