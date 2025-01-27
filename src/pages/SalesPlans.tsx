import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer, OrderItem, Product } from "@/types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { sr } from "date-fns/locale";
import { ProductSelect } from "@/components/sales/ProductSelect";
import { Button } from "@/components/ui/button";
import { useSalesData } from "@/hooks/useSalesData";
import { useSplitOrders } from "@/components/sales/hooks/useSplitOrders";

const SalesPlans = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(format(new Date(), 'EEEE', { locale: sr }).toLowerCase());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [completedVisits, setCompletedVisits] = useState<string[]>([]);
  const { products } = useSalesData();
  const { handleSubmitOrder, isSubmitting } = useSplitOrders(selectedCustomer);

  const fetchCustomers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Niste prijavljeni");
        return;
      }

      console.log("Fetching customers with visit days from kupci_darko table");
      const { data, error } = await supabase
        .from('kupci_darko')
        .select('*')
        .not('visit_day', 'is', null)
        .order('name');

      if (error) throw error;
      
      console.log("Fetched customers with visit days:", data?.length);
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error("Greška pri učitavanju kupaca");
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for customer updates
  useEffect(() => {
    const channel = supabase
      .channel('customer-visit-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kupci_darko',
          filter: 'visit_day=neq.null'
        },
        (payload) => {
          console.log('Customer visit day update received:', payload);
          fetchCustomers();
          toast.success('Plan poseta je ažuriran');
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCustomerSelect = (customer: Customer) => {
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer(null);
      setOrderItems([]);
    } else {
      setSelectedCustomer(customer);
      setOrderItems([]);
    }
  };

  const handleCompleteVisit = async () => {
    if (!selectedCustomer) return;

    try {
      const success = await handleSubmitOrder(orderItems);
      if (success) {
        setCompletedVisits(prev => [...prev, selectedCustomer.id]);
        setSelectedCustomer(null);
        setOrderItems([]);
        toast.success("Poseta je uspešno završena");
      }
    } catch (error) {
      console.error('Error completing visit:', error);
      toast.error("Greška pri završetku posete");
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.visit_day?.toLowerCase() === activeDay
  );

  const daysOfWeek = [
    { id: 'monday', label: 'Ponedeljak' },
    { id: 'tuesday', label: 'Utorak' },
    { id: 'wednesday', label: 'Sreda' },
    { id: 'thursday', label: 'Četvrtak' },
    { id: 'friday', label: 'Petak' },
    { id: 'saturday', label: 'Subota' },
    { id: 'sunday', label: 'Nedelja' },
  ];

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
                filteredCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className={`relative bg-white p-4 rounded-lg shadow-sm border ${
                      completedVisits.includes(customer.id) ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    } cursor-pointer`}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="absolute -right-3 -top-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
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

                    {selectedCustomer?.id === customer.id && (
                      <div className="mt-4 border-t pt-4">
                        <ProductSelect
                          products={products}
                          orderItems={orderItems}
                          selectedCustomer={customer}
                          onOrderItemsChange={setOrderItems}
                        />
                        {orderItems.length > 0 && (
                          <div className="mt-4 flex justify-end">
                            <Button
                              onClick={handleCompleteVisit}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Završavanje..." : "Završi posetu"}
                            </Button>
                          </div>
                        )}
                      </div>
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