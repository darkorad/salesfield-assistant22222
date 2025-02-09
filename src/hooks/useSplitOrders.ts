
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

    // Check if the user is using kupci_darko table
    const isUsingDarkoTable = session.user.email === 'zirmd.darko@gmail.com';

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
      items: orderItems,
      total: calculateTotal(items),
      payment_type: paymentType,
      payment_status: paymentType === 'cash' ? 'gotovina' : 'racun',
      date: new Date().toISOString()
    };

    // First verify the customer exists in the appropriate table
    const { data: customerExists, error: customerCheckError } = await supabase
      .from(isUsingDarkoTable ? 'kupci_darko' : 'customers')
      .select('id')
      .eq('id', selectedCustomer.id)
      .single();

    if (customerCheckError || !customerExists) {
      throw new Error(`Customer not found in ${isUsingDarkoTable ? 'kupci_darko' : 'customers'} table`);
    }

    console.log('Submitting order:', {
      ...orderData,
      customerType: isUsingDarkoTable ? 'darko' : 'regular',
      customerId: selectedCustomer.id,
      paymentType
    });

    // Insert the order
    const { data, error } = await supabase
      .from('sales')
      .insert([{
        ...orderData,
        // Set both foreign key fields, one will be null based on the table being used
        customer_id: isUsingDarkoTable ? null : selectedCustomer.id,
        darko_customer_id: isUsingDarkoTable ? selectedCustomer.id : null
      }])
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

      console.log('Splitting orders:', {
        cashItems: cashItems.length,
        invoiceItems: invoiceItems.length
      });

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
