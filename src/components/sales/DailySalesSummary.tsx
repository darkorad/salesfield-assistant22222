import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesTable } from "./SalesTable";
import { SalesActions } from "./SalesActions";
import { useDailySales } from "@/hooks/useDailySales";
import { useSentOrders } from "@/hooks/useSentOrders";
import { useState } from "react";
import { Contact } from "@/types";

const DailySalesSummary = () => {
  const { todaySales } = useDailySales();
  const { sentOrderIds, handleOrdersSent } = useSentOrders();
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