import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { sr } from "date-fns/locale";

const SalesPlans = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(format(new Date(), 'EEEE', { locale: sr }).toLowerCase());

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Niste prijavljeni");
          return;
        }

        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (error) throw error;
        setCustomers(data || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error("Greška pri učitavanju kupaca");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const daysOfWeek = [
    { id: 'monday', label: 'Ponedeljak' },
    { id: 'tuesday', label: 'Utorak' },
    { id: 'wednesday', label: 'Sreda' },
    { id: 'thursday', label: 'Četvrtak' },
    { id: 'friday', label: 'Petak' },
    { id: 'saturday', label: 'Subota' },
    { id: 'sunday', label: 'Nedelja' },
  ];

  const filteredCustomers = customers.filter(customer => 
    customer.visit_day === activeDay
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Planovi prodaje</h1>
      
      <Tabs value={activeDay} onValueChange={setActiveDay}>
        <TabsList className="grid grid-cols-7 mb-6">
          {daysOfWeek.map((day) => (
            <TabsTrigger key={day.id} value={day.id} className="text-sm">
              {day.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {daysOfWeek.map((day) => (
          <TabsContent key={day.id} value={day.id}>
            <div className="grid gap-4">
              {loading ? (
                <div className="text-center">Učitavanje...</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center text-gray-500">
                  Nema zakazanih poseta za {day.label.toLowerCase()}
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{customer.name}</h3>
                        <p className="text-sm text-gray-600">{customer.address}, {customer.city}</p>
                        {customer.visit_type && (
                          <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
                            customer.visit_type === 'visit' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {customer.visit_type === 'visit' ? 'Poseta' : 'Poziv'}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {customer.visit_duration && (
                          <span className="text-sm text-gray-500">
                            Trajanje: {customer.visit_duration} min
                          </span>
                        )}
                      </div>
                    </div>
                    {customer.visit_notes && (
                      <p className="mt-2 text-sm text-gray-600 border-t pt-2">
                        {customer.visit_notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SalesPlans;