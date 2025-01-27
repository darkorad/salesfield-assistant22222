import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const ExportData = () => {
  const [groupSearch, setGroupSearch] = useState("");

  const handleExportBuyers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      // First get filtered groups
      const { data: groups, error: groupsError } = await supabase
        .from('customer_groups')
        .select('name')
        .eq('user_id', session.user.id)
        .ilike('name', `%${groupSearch}%`);

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        toast.error("Greška pri preuzimanju grupa");
        return;
      }

      const groupNames = groups?.map(g => g.name) || [];

      // Then get customers from those groups
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', session.user.id)
        .in('group_name', groupNames);

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        toast.error("Greška pri preuzimanju podataka");
        return;
      }

      if (!customers || customers.length === 0) {
        toast.error("Nema podataka o kupcima u izabranim grupama");
        return;
      }

      const ws = XLSX.utils.json_to_sheet(customers);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Kupci");
      
      const colWidths = [
        { wch: 15 }, // code
        { wch: 30 }, // name
        { wch: 40 }, // address
        { wch: 20 }, // city
        { wch: 15 }, // phone
        { wch: 15 }, // pib
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `lista-kupaca.xlsx`);
      toast.success("Lista kupaca je uspešno izvezena");
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast.error("Greška pri izvozu kupaca");
    }
  };

  const handleExportPrices = () => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      toast.error("No user logged in");
      return;
    }

    const products = localStorage.getItem(`products_${currentUser}`);
    if (!products) {
      toast.error("Nema podataka o cenama");
      return;
    }

    const productsData = JSON.parse(products);
    const ws = XLSX.utils.json_to_sheet(productsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cenovnik");
    
    const colWidths = [
      { wch: 30 }, // name
      { wch: 20 }, // manufacturer
      { wch: 15 }, // price
      { wch: 10 }, // unit
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `cenovnik.xlsx`);
    toast.success("Cenovnik je uspešno izvezen");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Izvoz podataka</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Pretraži grupe..."
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
            className="mb-2"
          />
          <Button
            className="w-full py-6 text-lg font-medium"
            onClick={handleExportBuyers}
          >
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Izvezi listu kupaca
          </Button>
        </div>
        <Button
          className="w-full py-6 text-lg font-medium"
          onClick={handleExportPrices}
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Izvezi cenovnik
        </Button>
      </CardContent>
    </Card>
  );
};