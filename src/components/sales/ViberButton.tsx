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

      return `${sale.customer.name}\n` +
             `${sale.customer.address}, ${sale.customer.city}\n` +
             `${itemsList}\n` +
             `${sale.total} RSD\n` +
             `${sale.paymentType === 'cash' ? 'Gotovina' : 'Račun'}`;
    }).join('\n\n-------------------\n\n');

    // Create viber message URL with the contact's number
    const message = encodeURIComponent(formattedMessage);
    window.open(`viber://send?number=${encodeURIComponent(contact.viber)}&text=${message}`);
    
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