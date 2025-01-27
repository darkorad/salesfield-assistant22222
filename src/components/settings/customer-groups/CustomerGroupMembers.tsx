import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CustomerGroupMembersProps {
  groupId: string;
}

export const CustomerGroupMembers = ({ groupId }: CustomerGroupMembersProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching customers and group members");
        const [customersResponse, membersResponse] = await Promise.all([
          supabase.from('kupci_darko').select('*').order('name'),
          supabase.from('customer_group_members')
            .select('customer_id')
            .eq('group_id', groupId)
        ]);

        if (customersResponse.error) throw customersResponse.error;
        if (membersResponse.error) throw membersResponse.error;

        console.log("Fetched customers:", customersResponse.data?.length);
        console.log("Fetched members:", membersResponse.data?.length);

        setCustomers(customersResponse.data || []);
        setMembers(membersResponse.data.map(m => m.customer_id));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Greška pri učitavanju podataka");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const toggleMember = async (customerId: string) => {
    try {
      const isMember = members.includes(customerId);
      
      if (isMember) {
        const { error } = await supabase
          .from('customer_group_members')
          .delete()
          .eq('group_id', groupId)
          .eq('customer_id', customerId);

        if (error) throw error;
        setMembers(members.filter(id => id !== customerId));
        toast.success("Kupac je uklonjen iz grupe");
      } else {
        const { error } = await supabase
          .from('customer_group_members')
          .insert({ group_id: groupId, customer_id: customerId });

        if (error) throw error;
        setMembers([...members, customerId]);
        toast.success("Kupac je dodat u grupu");
      }
    } catch (error) {
      console.error('Error toggling member:', error);
      toast.error("Greška pri ažuriranju članova grupe");
    }
  };

  if (loading) {
    return <div className="text-center py-4">Učitavanje...</div>;
  }

  return (
    <div className="mt-4 space-y-2">
      {customers.map((customer) => (
        <div
          key={customer.id}
          className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg"
        >
          <div>
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-gray-600">
              {customer.address}, {customer.city}
            </div>
          </div>
          <Button
            variant={members.includes(customer.id) ? "default" : "outline"}
            onClick={() => toggleMember(customer.id)}
          >
            {members.includes(customer.id) ? "Ukloni" : "Dodaj"}
          </Button>
        </div>
      ))}
    </div>
  );
};