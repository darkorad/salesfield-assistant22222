import { useState } from "react";
import { Customer, OrderItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSplitOrders = (selectedCustomer: Customer | null) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => {
      const unitSize = parseFloat(item.product["Jedinica mere"]) || 1;
      return sum + (item.product.Cena * item.quantity * unitSize);
    }, 0);
  };

  const submitOrder = async (items: OrderItem[], paymentType: 'cash' | 'invoice', note?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !selectedCustomer) {
      throw new Error("Authentication or customer selection required");
    }

    const orderItems = note 
      ? items.map(item => ({ ...item })).concat([{ 
          product: { 
            Naziv: 'Napomena',
            Proizvođač: '',
            Cena: 0,
            "Jedinica mere": '',
            id: '0',
            user_id: session.user.id
          },
          quantity: 0,
          paymentType,
          note
        }])
      : items;

    const orderData = {
      user_id: session.user.id,
      customer_id: selectedCustomer.id,
      items: orderItems,
      total: calculateTotal(items),
      payment_type: paymentType,
      date: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('sales')
      .insert([orderData])
      .select();

    if (error) throw error;
    return data;
  };

  const handleSubmitOrder = async (orderItems: OrderItem[], note?: string) => {
    try {
      if (!selectedCustomer) {
        toast.error("Molimo izaberite kupca");
        return false;
      }
      if (orderItems.length === 0) {
        toast.error("Molimo dodajte bar jedan proizvod");
        return false;
      }

      setIsSubmitting(true);

      const cashItems = orderItems.filter(item => item.paymentType === 'cash');
      const invoiceItems = orderItems.filter(item => item.paymentType === 'invoice');

      if (cashItems.length > 0) {
        await submitOrder(cashItems, 'cash', note);
      }
      
      if (invoiceItems.length > 0) {
        await submitOrder(invoiceItems, 'invoice', note);
      }

      toast.success("Porudžbina je uspešno poslata!");
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