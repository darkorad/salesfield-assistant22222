
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

export async function exportBuyersList(groupSearch: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return false;
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
      return false;
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
      return false;
    }

    if (!customers || customers.length === 0) {
      toast.error("Nema podataka o kupcima u izabranim grupama");
      return false;
    }

    // Transform data to match import format
    const exportData = customers.map(customer => ({
      id: customer.id,
      code: customer.code,
      Naziv: customer.name,
      Adresa: customer.address,
      Grad: customer.city,
      Telefon: customer.phone || '',
      PIB: customer.pib,
      "PDV Obveznik": customer.is_vat_registered ? "DA" : "NE",
      "GPS Koordinate": customer.gps_coordinates || '',
      Grupa: customer.group_name || '',
      Naselje: customer.naselje || '',
      Email: customer.email || '',
      "Dan obilaska (stari)": customer.visit_day || '',
      "Dan obilaska (novi)": customer.dan_obilaska || '',
      "Dan posete": customer.dan_posete || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kupci");
    
    const colWidths = [
      { wch: 40 }, // id
      { wch: 15 }, // code
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
      { wch: 20 }, // dan_obilaska
      { wch: 20 }, // dan_posete
    ];
    ws['!cols'] = colWidths;

    // Get current date for better filename
    const today = new Date();
    const dateStr = today.toLocaleDateString('sr-RS').replace(/\./g, '-');
    
    XLSX.writeFile(wb, `lista-kupaca-${dateStr}.xlsx`);
    toast.success("Lista kupaca je uspešno izvezena");
    return true;
  } catch (error) {
    console.error('Error exporting customers:', error);
    toast.error("Greška pri izvozu kupaca");
    return false;
  }
}
