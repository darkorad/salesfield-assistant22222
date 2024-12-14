import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare } from "lucide-react";
import { Order } from "@/types";
import { toast } from "sonner";

interface Contact {
  name: string;
  viber: string;
}

const DailySalesSummary = () => {
  const [todaySales, setTodaySales] = useState<Order[]>([]);
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
    const sales = localStorage.getItem("sales");
    if (sales) {
      const allSales = JSON.parse(sales) as Order[];
      const today = new Date().toISOString().split("T")[0];
      const filteredSales = allSales.filter(
        (sale) => sale.date.split("T")[0] === today
      );
      setTodaySales(filteredSales);
    }
  };

  useEffect(() => {
    loadTodaySales();
    // Set up an interval to check for new sales every few seconds
    const interval = setInterval(loadTodaySales, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSendViber = (contact: Contact) => {
    if (!contact.viber) {
      toast.error(`Viber broj za ${contact.name} nije podešen`);
      return;
    }
    // Here you would implement the actual Viber sending logic
    const message = `Dnevni izveštaj prodaje:\n${todaySales
      .map(
        (sale) =>
          `${sale.customer.name}: ${sale.total} RSD (${sale.items.length} stavki)`
      )
      .join("\n")}`;
    toast.success(`Izveštaj poslat na Viber: ${contact.name}`);
  };

  const handleSendEmail = () => {
    if (!contacts.email) {
      toast.error("Email adresa nije podešena");
      return;
    }
    // Here you would implement the actual email sending logic
    toast.success("Izveštaj poslat na email");
  };

  return (
    <Card className="mt-4 md:mt-8">
      <CardHeader>
        <CardTitle>Današnje porudžbine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {todaySales.map((sale) => (
              <div
                key={sale.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-2 gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">#{sale.id.slice(-4)}</span>
                  <span className="font-medium">{sale.customer.name}</span>
                </div>
                <div className="flex justify-between w-full md:w-auto gap-2">
                  <span className="md:hidden">Ukupno:</span>
                  <span className="font-medium">{sale.total} RSD</span>
                </div>
              </div>
            ))}
            {todaySales.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                Nema porudžbina za danas
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {contacts.contacts.map((contact) => (
              <Button
                key={contact.name}
                onClick={() => handleSendViber(contact)}
                className="w-full"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Viber {contact.name}
              </Button>
            ))}
            <Button onClick={handleSendEmail} className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySalesSummary;