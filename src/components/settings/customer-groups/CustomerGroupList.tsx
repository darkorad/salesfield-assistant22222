import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CustomerGroupMembers } from "./CustomerGroupMembers";

interface CustomerGroup {
  id: string;
  name: string;
  description: string | null;
}

export const CustomerGroupList = () => {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CustomerGroup | null>(null);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_groups')
        .select('*')
        .order('name');

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error("Greška pri učitavanju grupa");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Postojeće grupe</h3>
      
      <div className="grid gap-4">
        {groups.map((group) => (
          <div key={group.id} className="p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{group.name}</h4>
                {group.description && (
                  <p className="text-sm text-gray-600">{group.description}</p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedGroup(selectedGroup?.id === group.id ? null : group)}
              >
                {selectedGroup?.id === group.id ? 'Zatvori' : 'Upravljaj članovima'}
              </Button>
            </div>
            
            {selectedGroup?.id === group.id && (
              <CustomerGroupMembers groupId={group.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};