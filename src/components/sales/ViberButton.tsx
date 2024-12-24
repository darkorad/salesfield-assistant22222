import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";

interface ViberButtonProps {
  contact: {
    name: string;
    viber: string;
  };
  sales: Order[];
  onOrdersSent: (sentOrderIds: string[]) => void;
}

export const ViberButton = ({ contact, sales, onOrdersSent }: ViberButtonProps) => {
  const handleSendViber = () => {
    if (!contact.viber) {
      toast.error(`Viber broj za ${contact.name} nije podešen`);
      return;
    }

    // Create formatted message for each sale
    const formattedMessage = sales.map(sale => {
      const itemsList = sale.items
        .map(item => `${item.product.Naziv} - ${item.quantity} ${item.product["Jedinica mere"]}`)
        .join('\n');

      return `Kupac: ${sale.customer.name}\n` +
             `Adresa: ${sale.customer.address}, ${sale.customer.city}\n` +
             `\nArtikli:\n${itemsList}\n` +
             `\nUkupno: ${sale.total} RSD\n` +
             `Način plaćanja: ${sale.paymentType === 'cash' ? 'Gotovina' : 'Račun'}\n` +
             '------------------------';
    }).join('\n\n');

    // Create viber message URL
    const message = encodeURIComponent(formattedMessage);
    window.open(`viber://forward?text=${message}`);
    
    // Mark orders as sent
    const sentOrderIds = sales.map(sale => sale.id);
    onOrdersSent(sentOrderIds);
    
    toast.success(`Izveštaj pripremljen za slanje na Viber: ${contact.name}`);
  };

  return (
    <Button onClick={handleSendViber} className="w-full">
      <MessageSquare className="mr-2 h-4 w-4" />
      Viber {contact.name}
    </Button>
  );
};