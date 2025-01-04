import { useState, useEffect } from "react";
import { Customer, Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { CustomerSelect } from "@/components/sales/CustomerSelect";
import { toast } from "sonner";
import { PriceForm } from "./customer-prices/PriceForm";
import { PricesList } from "./customer-prices/PricesList";

export const CustomerPrices = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerPrices, setCustomerPrices] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomersAndProducts();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerPrices();
    }
  }, [selectedCustomer]);

  const fetchCustomersAndProducts = async () => {
    try {
      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*');
      
      if (customersError) throw customersError;
      
      // Get user email to determine which products table to use
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      // Fetch products based on user email
      let productsData;
      if (session.user.email === 'zirmd.darko@gmail.com') {
        const { data, error } = await supabase
          .from('products_darko')
          .select('*')
          .not('Naziv', 'eq', '');
        
        if (error) throw error;
        productsData = data;
      } else {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', session.user.id)
          .not('Naziv', 'eq', '');
        
        if (error) throw error;
        productsData = data;
      }

      setCustomers(customersData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Greška pri učitavanju podataka");
    }
  };

  const fetchCustomerPrices = async () => {
    if (!selectedCustomer) return;

    try {
      const { data, error } = await supabase
        .from('customer_prices')
        .select('*')
        .eq('customer_id', selectedCustomer.id);

      if (error) throw error;
      setCustomerPrices(data || []);
    } catch (error) {
      console.error('Error fetching customer prices:', error);
      toast.error("Greška pri učitavanju cena");
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Posebne cene za kupce</h2>
      
      <div className="space-y-4">
        <CustomerSelect
          customers={customers}
          customerSearch={customerSearch}
          onCustomerSearchChange={setCustomerSearch}
          onCustomerSelect={handleCustomerSelect}
        />

        {selectedCustomer && (
          <>
            <PriceForm 
              customer={selectedCustomer}
              products={products}
              onSave={fetchCustomerPrices}
            />
            
            {customerPrices.length > 0 && (
              <PricesList 
                customerPrices={customerPrices}
                products={products}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};