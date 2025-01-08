import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CustomerGroupMembers } from "./CustomerGroupMembers";
import { FileSpreadsheet, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";

interface CustomerGroup {
  id: string;
  name: string;
  description: string | null;
}

interface Customer {
  id: string;
  name: string;
  group_name?: string;
  city?: string;
  naselje?: string;
}

export const CustomerGroupList = () => {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CustomerGroup | null>(null);

  const fetchGroups = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      console.log("Fetching groups for user:", session.user.id);
      
      const { data, error } = await supabase
        .from('customer_groups')
        .select('*')
        .eq('user_id', session.user.id)
        .order('name');

      if (error) {
        console.error('Error fetching groups:', error);
        throw error;
      }
      
      console.log("Fetched groups:", data);
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error("Greška pri učitavanju grupa");
    }
  };

  const handleExportCustomers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const { data: customers, error } = await supabase
        .from('customers')
        .select('name, group_name, city, naselje')
        .eq('user_id', session.user.id)
        .order('name');

      if (error) throw error;

      const ws = XLSX.utils.json_to_sheet(customers || []);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Kupci i grupe");
      
      ws['!cols'] = [
        { wch: 40 }, // name
        { wch: 20 }, // group_name
        { wch: 20 }, // city
        { wch: 20 }, // naselje
      ];

      XLSX.writeFile(wb, `kupci-grupe.xlsx`);
      toast.success("Lista kupaca i grupa je uspešno izvezena");
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast.error("Greška pri izvozu kupaca");
    }
  };

  const handleImportCustomers = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet) as { 
            name: string; 
            group_name: string;
            city?: string;
            naselje?: string;
          }[];

          console.log("Imported data:", jsonData);

          // First, ensure groups exist
          const uniqueGroups = [...new Set(jsonData.filter(item => item.group_name).map(item => item.group_name))];
          
          for (const groupName of uniqueGroups) {
            const { data: existingGroup, error: checkError } = await supabase
              .from('customer_groups')
              .select('id')
              .eq('name', groupName)
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (checkError) {
              console.error('Error checking group:', groupName, checkError);
              continue;
            }

            if (!existingGroup) {
              const { error: createError } = await supabase
                .from('customer_groups')
                .insert({
                  name: groupName,
                  user_id: session.user.id
                });

              if (createError) {
                console.error('Error creating group:', groupName, createError);
              } else {
                console.log('Created new group:', groupName);
              }
            }
          }

          // Update customers with new group names and location data
          for (const customer of jsonData) {
            if (customer.name) {
              const updateData: {
                group_name?: string;
                city?: string;
                naselje?: string;
                user_id: string;
              } = {
                user_id: session.user.id
              };

              if (customer.group_name) updateData.group_name = customer.group_name;
              if (customer.city) updateData.city = customer.city;
              if (customer.naselje) updateData.naselje = customer.naselje;

              const { error: updateError } = await supabase
                .from('customers')
                .update(updateData)
                .eq('name', customer.name)
                .eq('user_id', session.user.id);

              if (updateError) {
                console.error('Error updating customer:', customer.name, updateError);
              } else {
                console.log('Updated customer:', customer.name);
              }
            }
          }

          toast.success("Grupe kupaca su uspešno ažurirane");
          fetchGroups(); // Refresh the groups list
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error("Greška pri obradi fajla");
        }
      };

      reader.onerror = () => {
        toast.error("Greška pri čitanju fajla");
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error importing customers:', error);
      toast.error("Greška pri uvozu kupaca");
    }
  };

  useEffect(() => {
    fetchGroups();

    // Set up real-time subscription for customer_groups table
    const channel = supabase
      .channel('customer-groups-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_groups'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchGroups(); // Refresh groups when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-6">
        <Button
          onClick={handleExportCustomers}
          className="w-full sm:w-auto"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Izvezi kupce i grupe
        </Button>
        <div className="relative w-full sm:w-auto">
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportCustomers}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Uvezi kupce i grupe
          </Button>
        </div>
      </div>
      
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