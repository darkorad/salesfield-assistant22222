import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomerGroupSelectProps {
  selectedGroup: { id: string; name: string } | null;
  onGroupSelect: (group: { id: string; name: string } | null) => void;
}

export const CustomerGroupSelect = ({ selectedGroup, onGroupSelect }: CustomerGroupSelectProps) => {
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data: groupsData, error } = await supabase
        .from('customer_groups')
        .select('id, name');

      if (error) {
        console.error('Error fetching groups:', error);
        toast.error("Greška pri učitavanju grupa");
        return;
      }

      setGroups(groupsData || []);
    };

    fetchGroups();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('group-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_groups'
        },
        () => {
          fetchGroups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Grupa kupaca</label>
      <Select
        value={selectedGroup?.id}
        onValueChange={(value) => {
          const group = groups.find(g => g.id === value);
          onGroupSelect(group || null);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Izaberite grupu kupaca" />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};