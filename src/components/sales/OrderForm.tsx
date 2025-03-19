
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CustomerSelect } from './CustomerSelect';
import { OrderItemsList } from './OrderItemsList';
import { ProductSelect } from './ProductSelect';
import { OrderSummary } from './OrderSummary';
import { SalesActions } from './SalesActions';
import { OrderItem, Customer, Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { checkOnlineStatus, storePendingSale } from '@/utils/offlineStorage';
import { v4 as uuidv4 } from 'uuid';

interface OrderFormProps {
  customers: Customer[];
  products: Product[];
}

export const OrderForm: React.FC<OrderFormProps> = ({ customers, products }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);

  // Clear the form
  const resetForm = () => {
    setSelectedCustomer(null);
    setOrderItems([]);
    setTotal(0);
  };

  // Handle form submission
  const handleSubmit = async (paymentType: 'cash' | 'invoice') => {
    if (!selectedCustomer) {
      toast.error("Izaberite kupca");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Dodajte proizvode u porudžbinu");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if we're online
      const isOnline = await checkOnlineStatus();
      
      // Create the order object 
      const customerIdField = selectedCustomer.user_id ? 'customer_id' : 'darko_customer_id';
      
      const order = {
        id: uuidv4(),
        [customerIdField]: selectedCustomer.id,
        items: orderItems,
        total,
        payment_status: paymentType === 'cash' ? 'gotovina' : 'racun',
        payment_type: paymentType,
        date: new Date().toISOString(),
        customer: selectedCustomer,
        userId: '' // We'll set this properly below
      };

      if (!isOnline) {
        // Store offline - we're not connected
        await storePendingSale(order);
        toast.success("Porudžbina sačuvana offline. Biće sinhronizovana kada budete online.");
        resetForm();
        return;
      }

      // We're online, submit normally
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      // Add user_id to the order
      order.userId = session.user.id;

      // Send to Supabase
      const { error } = await supabase
        .from('sales')
        .insert([order]);

      if (error) throw error;

      toast.success("Porudžbina uspešno poslata!");
      resetForm();
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error("Greška pri slanju porudžbine");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 md:p-6">
        <h2 className="text-2xl font-semibold mb-6">Nova porudžbina</h2>
        
        <CustomerSelect 
          customers={customers} 
          customerSearch={selectedCustomer?.name || ''}
          onCustomerSearchChange={(value) => {
            // This is a placeholder; the actual implementation will depend on how CustomerSelect works
            if (!value) setSelectedCustomer(null);
          }}
          onCustomerSelect={setSelectedCustomer}
        />
        
        {selectedCustomer && (
          <>
            <ProductSelect
              products={products}
              orderItems={orderItems}
              selectedCustomer={selectedCustomer}
              onOrderItemsChange={setOrderItems}
            />
            
            <OrderItemsList 
              items={orderItems} 
              onQuantityChange={(index, quantity) => {
                const newItems = [...orderItems];
                newItems[index] = {
                  ...newItems[index],
                  quantity: Math.max(1, quantity)
                };
                setOrderItems(newItems);
              }}
              onPaymentTypeChange={(index, paymentType) => {
                const newItems = [...orderItems];
                newItems[index] = {
                  ...newItems[index],
                  paymentType
                };
                setOrderItems(newItems);
              }}
              onRemoveItem={(index) => {
                setOrderItems(orderItems.filter((_, i) => i !== index));
              }}
            />
            
            <OrderSummary orderItems={orderItems} />
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
                Poništi
              </Button>
              <Button onClick={() => handleSubmit('invoice')} disabled={isSubmitting}>
                Pošalji (Račun)
              </Button>
              <Button onClick={() => handleSubmit('cash')} disabled={isSubmitting}>
                Pošalji (Gotovina)
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
