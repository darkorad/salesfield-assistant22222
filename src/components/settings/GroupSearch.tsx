import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const GroupSearch = () => {
  const [groupSearch, setGroupSearch] = useState("");
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Niste prijavljeni");
          return;
        }

        const { data: groups, error } = await supabase
          .from('customer_groups')
          .select('id, name')
          .eq('user_id', session.user.id)
          .ilike('name', `%${groupSearch}%`);

        if (error) {
          console.error('Error fetching groups:', error);
          toast.error("Greška pri pretraživanju grupa");
          return;
        }

        setGroups(groups || []);
      } catch (error) {
        console.error('Error in fetchGroups:', error);
        toast.error("Greška pri pretraživanju grupa");
      }
    };

    if (groupSearch) {
      fetchGroups();
    } else {
      setGroups([]);
    }
  }, [groupSearch]);

  const handleGroupClick = async (group: { id: string; name: string }) => {
    setSelectedGroup(group);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const { data: customers, error } = await supabase
        .from('customers')
        .select('name')
        .eq('group_name', group.name)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching group customers:', error);
        toast.error("Greška pri učitavanju kupaca iz grupe");
        return;
      }

      const customerCount = customers?.length || 0;
      toast.success(`Grupa ${group.name} ima ${customerCount} kupaca`);
    } catch (error) {
      console.error('Error handling group click:', error);
      toast.error("Greška pri učitavanju informacija o grupi");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pretraži grupe</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Unesite naziv grupe..."
          value={groupSearch}
          onChange={(e) => setGroupSearch(e.target.value)}
        />
        {groups.length > 0 && (
          <div className="mt-4 space-y-2">
            {groups.map((group) => (
              <Button
                key={group.id}
                variant="ghost"
                className="w-full justify-start text-left hover:bg-gray-100"
                onClick={() => handleGroupClick(group)}
              >
                {group.name}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};