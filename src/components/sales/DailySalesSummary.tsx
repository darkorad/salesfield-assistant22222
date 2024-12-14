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

  useEffect(() => {
    const sales = localStorage.getItem("sales");
    if (sales) {
      const allSales = JSON.parse(sales) as Order[];
      const today = new Date().toISOString().split("T")[0];
      const filteredSales = allSales.filter(
        (sale) => sale.date.split("T")[0] === today
      );
      setTodaySales(filteredSales);
    }
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
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Današnje porudžbine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {todaySales.map((sale) => (
              <div
                key={sale.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <span>{sale.customer.name}</span>
                <span className="font-medium">{sale.total} RSD</span>
              </div>
            ))}
            {todaySales.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                Nema porudžbina za danas
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {contacts.contacts.map((contact) => (
              <Button
                key={contact.name}
                onClick={() => handleSendViber(contact)}
                className="flex-1"
              >
                <MessageSquare />
                Viber {contact.name}
              </Button>
            ))}
            <Button onClick={handleSendEmail} className="flex-1">
              <Mail />
              Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySalesSummary;