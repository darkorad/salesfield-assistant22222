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

    // Create viber message URL
    const message = encodeURIComponent(`Dnevni izveštaj prodaje:\n${sales
      .map(
        (sale) =>
          `${sale.customer.name}: ${sale.total} RSD (${sale.items.length} stavki)`
      )
      .join("\n")}`);
    
    // Open Viber with pre-filled message
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