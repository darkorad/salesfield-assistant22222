import { useState } from "react";
import { Customer, OrderItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSplitOrders = (selectedCustomer: Customer | null) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitSplitOrders = async (items: OrderItem[], paymentType: 'cash' | 'invoice') => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    const calculateTotal = (items: OrderItem[]) => {
      return items.reduce((sum, item) => {
        const unitSize = parseFloat(item.product["Jedinica mere"]) || 1;
        return sum + (item.product.Cena * item.quantity * unitSize);
      }, 0);
    };

    const { data, error } = await supabase
      .from('sales')
      .insert([{
        user_id: session.user.id,
        customer_id: selectedCustomer!.id,
        items: items,
        total: calculateTotal(items),
        payment_type: items[0].paymentType,
        date: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error("Error submitting order:", error);
      throw error;
    }

    return data;
  };

  const handleSubmitOrder = async (orderItems: OrderItem[]) => {
    try {
      if (!selectedCustomer) {
        toast.error("Molimo izaberite kupca");
        return;
      }
      if (orderItems.length === 0) {
        toast.error("Molimo dodajte bar jedan proizvod");
        return;
      }

      setIsSubmitting(true);

      // Split items by payment type
      const cashItems = orderItems.filter(item => item.paymentType === 'cash');
      const invoiceItems = orderItems.filter(item => item.paymentType === 'invoice');

      // Submit orders based on split
      if (cashItems.length > 0 && invoiceItems.length > 0) {
        await submitSplitOrders(cashItems, 'cash');
        await submitSplitOrders(invoiceItems, 'invoice');
        toast.success("Porudžbine su uspešno poslate!");
      } else if (cashItems.length > 0) {
        await submitSplitOrders(cashItems, 'cash');
        toast.success("Porudžbina za gotovinu je uspešno poslata!");
      } else {
        await submitSplitOrders(invoiceItems, 'invoice');
        toast.success("Porudžbina za račun je uspešno poslata!");
      }

      return true;
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Greška pri slanju porudžbine");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmitOrder,
    isSubmitting
  };
};