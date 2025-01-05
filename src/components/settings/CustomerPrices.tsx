import { useState, useEffect } from "react";
import { Customer, Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PriceForm } from "./customer-prices/PriceForm";
import { PricesList } from "./customer-prices/PricesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupPriceForm } from "./customer-prices/GroupPriceForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CustomerPrices = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [customerPrices, setCustomerPrices] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomersAndProducts();
  }, []);

  const fetchCustomersAndProducts = async () => {
    try {
      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*');
      
      if (customersError) throw customersError;
      
      // Get unique groups
      const uniqueGroups = Array.from(new Set(customersData?.map(c => c.group_name).filter(Boolean)));
      setGroups(uniqueGroups);

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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Promena cena</h2>
      
      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="individual">Pojedinačno</TabsTrigger>
          <TabsTrigger value="group">Grupno</TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Izaberite kupca</label>
              <Select
                value={selectedCustomer?.id}
                onValueChange={(value) => {
                  const customer = customers.find(c => c.id === value);
                  setSelectedCustomer(customer || null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Izaberite kupca" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCustomer && (
              <PriceForm 
                customer={selectedCustomer}
                products={products}
                onSave={() => {
                  toast.success("Cene su uspešno sačuvane");
                }}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="group">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Izaberite grupu</label>
              <Select
                value={selectedGroup}
                onValueChange={setSelectedGroup}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Izaberite grupu kupaca" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedGroup && (
              <GroupPriceForm
                groupName={selectedGroup}
                products={products}
                onSave={() => {
                  toast.success("Cene su uspešno sačuvane za grupu");
                }}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};