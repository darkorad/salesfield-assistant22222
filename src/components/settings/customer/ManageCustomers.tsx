import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Customer } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { EditCustomerDialog } from "./EditCustomerDialog";
import { toast } from "sonner";

export const ManageCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setCustomers([]);
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Niste prijavljeni");
        return;
      }

      console.log("Searching customers in kupci_darko table with query:", searchQuery);
      const { data, error } = await supabase
        .from('kupci_darko')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
        .order('name');

      if (error) throw error;
      console.log("Found customers:", data?.length);
      setCustomers(data || []);
    } catch (error) {
      console.error('Error searching customers:', error);
      toast.error("Greška pri pretraživanju kupaca");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upravljanje kupcima</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Pretraži kupce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {loading ? (
            <div className="text-center py-4">Učitavanje...</div>
          ) : searchTerm.trim() ? (
            <div className="space-y-2">
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex justify-between items-start p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{customer.name}</h3>
                      <p className="text-sm text-gray-600">
                        {customer.address}, {customer.city}
                      </p>
                      {customer.visit_day && (
                        <p className="text-sm text-blue-600">
                          Dan posete: {customer.visit_day}
                        </p>
                      )}
                    </div>
                    <EditCustomerDialog
                      selectedCustomer={customer}
                      onCustomerUpdate={() => fetchCustomers(searchTerm)}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Nema pronađenih kupaca
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Unesite tekst za pretragu kupaca
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};