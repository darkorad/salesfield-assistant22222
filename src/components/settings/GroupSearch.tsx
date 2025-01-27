import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const GroupSearch = () => {
  const [groupSearch, setGroupSearch] = useState("");
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);

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
              <div key={group.id} className="p-2 bg-gray-50 rounded-md">
                {group.name}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};