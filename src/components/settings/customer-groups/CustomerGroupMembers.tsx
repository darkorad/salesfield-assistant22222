import { useState, useEffect } from "react";
import { Customer } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CustomerGroupMembersProps {
  groupId: string;
}

export const CustomerGroupMembers = ({ groupId }: CustomerGroupMembersProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      // Fetch all customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (customersError) throw customersError;

      // Fetch existing group members
      const { data: membersData, error: membersError } = await supabase
        .from('customer_group_members')
        .select('customer_id')
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      setCustomers(customersData || []);
      setSelectedCustomers(membersData?.map(m => m.customer_id) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Greška pri učitavanju podataka");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerToggle = async (customerId: string) => {
    try {
      if (selectedCustomers.includes(customerId)) {
        // Remove from group
        const { error } = await supabase
          .from('customer_group_members')
          .delete()
          .eq('group_id', groupId)
          .eq('customer_id', customerId);

        if (error) throw error;
        setSelectedCustomers(prev => prev.filter(id => id !== customerId));
        toast.success("Kupac je uklonjen iz grupe");
      } else {
        // Add to group
        const { error } = await supabase
          .from('customer_group_members')
          .insert({ group_id: groupId, customer_id: customerId });

        if (error) throw error;
        setSelectedCustomers(prev => [...prev, customerId]);
        toast.success("Kupac je dodat u grupu");
      }
    } catch (error) {
      console.error('Error updating group members:', error);
      toast.error("Greška pri ažuriranju članova grupe");
    }
  };

  if (loading) {
    return <div>Učitavanje...</div>;
  }

  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      <div className="space-y-2">
        {customers.map((customer) => (
          <div key={customer.id} className="flex items-center space-x-2">
            <Checkbox
              id={customer.id}
              checked={selectedCustomers.includes(customer.id)}
              onCheckedChange={() => handleCustomerToggle(customer.id)}
            />
            <label
              htmlFor={customer.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {customer.name} - {customer.code}
            </label>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};