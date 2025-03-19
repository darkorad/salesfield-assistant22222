
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { exportWorkbook } from "@/utils/fileExport";
import { saveWorkbookToStorage } from "@/utils/fileStorage";
import { useNavigate } from "react-router-dom";
import { createRedirectToDocuments } from "@/utils/fileExport";

export const CustomerExport = () => {
  const navigate = useNavigate();
  const redirectToDocuments = createRedirectToDocuments(navigate);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExportBuyers = async () => {
    try {
      setIsExporting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      toast.info("Priprema izvoza kupaca...");
      
      const userEmail = session.user.email;
      let customers;
      let error;

      if (userEmail === 'zirmd.darko@gmail.com') {
        const response = await supabase
          .from('kupci_darko')
          .select('*')
          .eq('user_id', session.user.id);
        customers = response.data;
        error = response.error;
      } else if (userEmail === 'zirmd.veljko@gmail.com') {
        const response = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', session.user.id);
        customers = response.data;
        error = response.error;
      } else {
        // For any other user, try the standard customers table
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

      // Get current date for filename
      const today = new Date();
      const day = today.getDate().toString().padStart(2, '0');
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const year = today.getFullYear();
      const fileName = `Lista-kupaca-${day}-${month}-${year}`;
      
      // Save to storage
      const storedFile = await saveWorkbookToStorage(wb, fileName);
      
      if (storedFile) {
        toast.success(`Lista kupaca je uspešno sačuvana`, {
          description: `Možete je pronaći u meniju Dokumenti`,
          action: {
            label: 'Otvori Dokumenti',
            onClick: redirectToDocuments
          },
          duration: 8000
        });
      }

      // Use the exportWorkbook utility
      await exportWorkbook(wb, fileName);
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast.error("Greška pri izvozu kupaca");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      className="w-full py-6 text-lg font-medium"
      onClick={handleExportBuyers}
      disabled={isExporting}
    >
      <FileSpreadsheet className="mr-2 h-5 w-5" />
      {isExporting ? "Izvoz u toku..." : "Izvezi listu kupaca"}
    </Button>
  );
};
