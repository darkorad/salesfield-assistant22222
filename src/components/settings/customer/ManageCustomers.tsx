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
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Niste prijavljeni");
        return;
      }

      console.log("Fetching customers from kupci_darko table");
      const { data, error } = await supabase
        .from('kupci_darko')
        .select('*')
        .order('name');

      if (error) throw error;
      console.log("Fetched customers:", data?.length);
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error("Greška pri učitavanju kupaca");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
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
                    onCustomerUpdate={fetchCustomers}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};