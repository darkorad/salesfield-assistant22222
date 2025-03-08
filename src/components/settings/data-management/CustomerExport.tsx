
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

export const CustomerExport = () => {
  const handleExportBuyers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const userEmail = session.user.email;
      let customers;
      let error;

      if (userEmail === 'zirmd.darko@gmail.com') {
        const response = await supabase
          .from('kupci_darko')
          .select('*');
        customers = response.data;
        error = response.error;
      } else {
        const response = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', session.user.id);
        customers = response.data;
        error = response.error;
      }

      if (error) {
        console.error('Error fetching customers:', error);
        toast.error("Greška pri preuzimanju podataka");
        return;
      }

      if (!customers || customers.length === 0) {
        toast.error("Nema podataka o kupcima");
        return;
      }

      // Format data in the exact same format expected by import
      const exportData = customers.map(customer => ({
        name: customer.name,
        address: customer.address,
        city: customer.city,
        phone: customer.phone || '',
        pib: customer.pib,
        is_vat_registered: customer.is_vat_registered ? "DA" : "NE",
        gps_coordinates: customer.gps_coordinates || '',
        group_name: customer.group_name || '',
        naselje: customer.naselje || '',
        email: customer.email || '',
        visit_day: customer.visit_day || '',
        dan_posete: customer.dan_posete || '',
        dan_obilaska: customer.dan_obilaska || '',
        code: customer.code
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Kupci");
      
      const colWidths = [
        { wch: 30 }, // name
        { wch: 40 }, // address
        { wch: 20 }, // city
        { wch: 15 }, // phone
        { wch: 15 }, // pib
        { wch: 15 }, // pdv
        { wch: 30 }, // gps
        { wch: 20 }, // group
        { wch: 20 }, // naselje
        { wch: 30 }, // email
        { wch: 20 }, // visit_day
        { wch: 20 }, // dan_posete
        { wch: 20 }, // dan_obilaska
        { wch: 15 }, // code
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `lista-kupaca.xlsx`);
      toast.success("Lista kupaca je uspešno izvezena");
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast.error("Greška pri izvozu kupaca");
    }
  };

  return (
    <Button
      className="w-full py-6 text-lg font-medium"
      onClick={handleExportBuyers}
    >
      <FileSpreadsheet className="mr-2 h-5 w-5" />
      Izvezi listu kupaca
    </Button>
  );
};
