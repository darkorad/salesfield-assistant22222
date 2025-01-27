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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Niste prijavljeni");
          return;
        }

        // First, get unique group names from kupci_darko table without filtering null values
        const { data: darkoCustData, error: darkoError } = await supabase
          .from('kupci_darko')
          .select('group_name')
          .neq('group_name', '');  // Changed to exclude empty strings instead of null

        if (darkoError) {
          console.error('Error fetching darko customer groups:', darkoError);
          toast.error("Greška pri učitavanju grupa");
          return;
        }

        console.log('Raw darko customer groups:', darkoCustData);

        // Then get unique group names from customers table
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('group_name')
          .neq('group_name', '')
          .eq('user_id', session.user.id);

        if (customersError) {
          console.error('Error fetching customer groups:', customersError);
          toast.error("Greška pri učitavanju grupa");
          return;
        }

        // Combine and get unique group names
        const allGroupNames = [
          ...(darkoCustData?.map(c => c.group_name) || []),
          ...(customersData?.map(c => c.group_name) || [])
        ];
        
        // Filter out null, undefined, and empty strings, then get unique values
        const uniqueGroups = [...new Set(allGroupNames.filter(name => name && name.trim() !== ''))];
        console.log('Unique groups found:', uniqueGroups);
        
        // For each unique group name, ensure it exists in customer_groups table
        for (const groupName of uniqueGroups) {
          if (!groupName) continue;

          try {
            // Check if group already exists
            const { data: existingGroups, error: checkError } = await supabase
              .from('customer_groups')
              .select('id')
              .eq('name', groupName)
              .eq('user_id', session.user.id);

            if (checkError) {
              console.error('Error checking existing group:', groupName, checkError);
              continue;
            }

            if (!existingGroups || existingGroups.length === 0) {
              console.log('Creating new group:', groupName);
              // Create new group if it doesn't exist
              const { error: insertError } = await supabase
                .from('customer_groups')
                .insert({
                  name: groupName,
                  user_id: session.user.id
                });

              if (insertError) {
                console.error('Error creating group:', groupName, insertError);
              }
            }
          } catch (error) {
            console.error('Error processing group:', groupName, error);
          }
        }

        // Finally, fetch all groups
        const { data: groupsData, error: groupsError } = await supabase
          .from('customer_groups')
          .select('id, name')
          .eq('user_id', session.user.id)
          .order('name');

        if (groupsError) {
          console.error('Error fetching groups:', groupsError);
          toast.error("Greška pri učitavanju grupa");
          return;
        }

        console.log('Fetched groups:', groupsData);
        setGroups(groupsData || []);
      } catch (error) {
        console.error('Error in fetchGroups:', error);
        toast.error("Greška pri učitavanju grupa");
      }
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