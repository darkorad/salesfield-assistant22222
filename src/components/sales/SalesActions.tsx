
import { Customer, Order, OrderItem } from "@/types";
import { ViberButton } from "./ViberButton";
import { EmailButton } from "./EmailButton";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { SaveIcon, RefreshCw } from "lucide-react";

interface Contact {
  name: string;
  viber: string;
}

// Original props for displaying existing orders
interface ExistingSalesActionsProps {
  contacts: {
    email: string;
    contacts: Contact[];
  };
  sales: Order[];
  onOrdersSent: (sentOrderIds: string[]) => void;
}

// New props for creating new orders
interface NewOrderActionsProps {
  selectedCustomer: Customer;
  orderItems: OrderItem[];
  onReset: () => void;
}

// Union type to support both use cases
export type SalesActionsProps = ExistingSalesActionsProps | NewOrderActionsProps;

// Type guard to distinguish between props types
const isNewOrderProps = (props: SalesActionsProps): props is NewOrderActionsProps => {
  return 'selectedCustomer' in props && 'orderItems' in props && 'onReset' in props;
};

export const SalesActions = (props: SalesActionsProps) => {
  const [isSaving, setIsSaving] = useState(false);

  // Handle new order submission
  if (isNewOrderProps(props)) {
    const { selectedCustomer, orderItems, onReset } = props;

    const handleSaveOrder = async () => {
      if (orderItems.length === 0) {
        toast.error("Nema artikala u porudžbini");
        return;
      }

      try {
        setIsSaving(true);

        // Split orders by payment type
        const cashItems = orderItems.filter(item => item.paymentType === 'cash');
        const invoiceItems = orderItems.filter(item => item.paymentType === 'invoice');

        const saveOrderByType = async (items: OrderItem[], paymentType: 'cash' | 'invoice') => {
          if (items.length === 0) return;

          const total = items.reduce(
            (sum, item) => sum + (Number(item.product.Cena) * item.quantity),
            0
          );

          const order: Order = {
            id: uuidv4(),
            customer: selectedCustomer,
            items: items,
            total: total,
            payment_type: paymentType,
            sent: false,
            created_at: new Date().toISOString(),
          };

          const { error } = await supabase
            .from('sales')
            .insert({
              id: order.id,
              user_id: (await supabase.auth.getUser()).data.user?.id,
              customer_id: selectedCustomer.id,
              customer_name: selectedCustomer.name,
              items: items.map(item => ({
                product_id: item.product.id,
                product_name: item.product.Naziv,
                quantity: item.quantity,
                price: item.product.Cena,
                unit: item.product["Jedinica mere"] || 'kom'
              })),
              total: total,
              payment_type: paymentType,
              sent: false,
              created_at: order.created_at,
            });

          if (error) {
            throw error;
          }

          return order;
        };

        // Save orders for each payment type
        const savedCashOrder = await saveOrderByType(cashItems, 'cash');
        const savedInvoiceOrder = await saveOrderByType(invoiceItems, 'invoice');

        toast.success("Porudžbina uspešno sačuvana");
        onReset();
      } catch (error) {
        console.error("Error saving order:", error);
        toast.error("Greška pri čuvanju porudžbine");
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button 
          onClick={handleSaveOrder} 
          disabled={isSaving || orderItems.length === 0}
          className="w-full"
        >
          {isSaving ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <SaveIcon className="mr-2 h-4 w-4" />
          )}
          Sačuvaj porudžbinu
        </Button>
        <Button 
          variant="outline" 
          onClick={onReset}
          disabled={isSaving}
          className="w-full"
        >
          Otkaži
        </Button>
      </div>
    );
  }

  // Original implementation for existing sales
  const { contacts, sales, onOrdersSent } = props;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {contacts.contacts.map((contact) => (
        <ViberButton
          key={contact.name}
          contact={contact}
          sales={sales}
          onOrdersSent={onOrdersSent}
        />
      ))}
      <EmailButton
        email={contacts.email}
        sales={sales}
        onOrdersSent={onOrdersSent}
      />
    </div>
  );
};
