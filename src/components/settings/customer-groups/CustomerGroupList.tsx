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

interface ImportedCustomer {
  id?: string;
  name: string;
  group_name?: string;
  city?: string;
  naselje?: string;
  address?: string;
  phone?: string;
  pib?: string;
  is_vat_registered?: string | boolean;
  code?: string;
  gps_coordinates?: string;
  email?: string;
}

export const CustomerGroupList = () => {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CustomerGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCustomers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;

      const ws = XLSX.utils.json_to_sheet(customers || []);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Kupci i grupe");
      
      ws['!cols'] = [
        { wch: 40 }, // id
        { wch: 40 }, // user_id
        { wch: 15 }, // code
        { wch: 40 }, // name
        { wch: 40 }, // address
        { wch: 20 }, // city
        { wch: 15 }, // phone
        { wch: 15 }, // pib
        { wch: 10 }, // is_vat_registered
        { wch: 30 }, // gps_coordinates
        { wch: 20 }, // created_at
        { wch: 20 }, // group_name
        { wch: 20 }, // naselje
        { wch: 30 }, // email
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
          const jsonData = XLSX.utils.sheet_to_json(sheet) as ImportedCustomer[];

          console.log("Imported data:", jsonData);

          // First, ensure groups exist
          const uniqueGroups = [...new Set(jsonData.filter(item => item.group_name).map(item => item.group_name))];
          
          for (const groupName of uniqueGroups) {
            if (!groupName) continue;
            
            const { data: existingGroup } = await supabase
              .from('customer_groups')
              .select('id')
              .eq('name', groupName)
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (!existingGroup) {
              await supabase
                .from('customer_groups')
                .insert({
                  name: groupName,
                  user_id: session.user.id
                });
            }
          }

          // Update or insert customers
          for (const customer of jsonData) {
            // Skip if required fields are missing
            if (!customer.name || !customer.address || !customer.city || !customer.pib) {
              console.error('Skipping customer due to missing required fields:', customer);
              toast.error(`Preskočen kupac "${customer.name || 'Nepoznat'}" - nedostaju obavezna polja`);
              continue;
            }

            // Generate UUID if missing
            if (!customer.id) {
              customer.id = crypto.randomUUID();
            }

            // Generate code if missing
            if (!customer.code) {
              customer.code = Date.now().toString().slice(-6);
            }

            // Ensure PIB is not null or empty
            if (!customer.pib?.trim()) {
              console.error('Skipping customer due to missing PIB:', customer);
              toast.error(`Preskočen kupac "${customer.name}" - nedostaje PIB`);
              continue;
            }

            const updateData = {
              id: customer.id,
              user_id: session.user.id,
              code: customer.code,
              name: customer.name,
              address: customer.address,
              city: customer.city,
              phone: customer.phone || '',
              pib: customer.pib.trim(),
              is_vat_registered: typeof customer.is_vat_registered === 'string' 
                ? customer.is_vat_registered.toUpperCase() === 'DA' || customer.is_vat_registered.toLowerCase() === 'true'
                : Boolean(customer.is_vat_registered),
              gps_coordinates: customer.gps_coordinates || '',
              group_name: customer.group_name || null,
              naselje: customer.naselje || null,
              email: customer.email || null
            };

            const { error: upsertError } = await supabase
              .from('customers')
              .upsert(updateData);

            if (upsertError) {
              console.error('Error updating customer:', customer.name, upsertError);
              toast.error(`Greška pri ažuriranju kupca: ${customer.name}`);
            }
          }

          toast.success("Kupci su uspešno ažurirani");
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
          fetchGroups();
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

      <Input
        placeholder="Pretraži grupe..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      
      <div className="grid gap-4">
        {filteredGroups.map((group) => (
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
