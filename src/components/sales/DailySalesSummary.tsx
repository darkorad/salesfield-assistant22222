import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types";
import { SalesTable } from "./SalesTable";
import { SalesActions } from "./SalesActions";

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

  const loadTodaySales = () => {
    try {
      const sales = localStorage.getItem("sales");
      if (sales) {
        const allSales = JSON.parse(sales) as Order[];
        const today = new Date().toISOString().split("T")[0];
        console.log("Loading sales for date:", today);
        console.log("All sales:", allSales);
        
        const filteredSales = allSales.filter((sale) => {
          const saleDate = new Date(sale.date).toISOString().split("T")[0];
          return saleDate === today;
        });
        
        console.log("Filtered sales for today:", filteredSales);
        setTodaySales(filteredSales);
      }
    } catch (error) {
      console.error("Error loading sales:", error);
    }
  };

  useEffect(() => {
    loadTodaySales();
    const interval = setInterval(loadTodaySales, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleOrdersSent = (newSentOrderIds: string[]) => {
    const updatedSentOrders = [...sentOrderIds, ...newSentOrderIds];
    setSentOrderIds(updatedSentOrders);
    localStorage.setItem("sentOrders", JSON.stringify(updatedSentOrders));
  };

  // Calculate total for all sales, not just unsent ones
  const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);

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
                <span className="font-bold text-lg">{totalSales} RSD</span>
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