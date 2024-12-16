import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportToCSV, formatCustomerData, formatProductData } from "@/utils/export-utils";

export const useExportData = () => {
  const exportCustomers = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', session.session.user.id);

      if (error) {
        toast.error("Greška pri preuzimanju podataka");
        return;
      }

      const formattedData = formatCustomerData(customers);
      exportToCSV(formattedData, "kupci.csv");
      toast.success("Lista kupaca je uspešno izvezena");
    } catch (error) {
      console.error("Error exporting customers:", error);
      toast.error("Greška pri izvozu kupaca");
    }
  };

  const exportProducts = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', session.session.user.id);

      if (error) {
        toast.error("Greška pri preuzimanju podataka");
        return;
      }

      const formattedData = formatProductData(products);
      exportToCSV(formattedData, "cenovnik.csv");
      toast.success("Cenovnik je uspešno izvezen");
    } catch (error) {
      console.error("Error exporting products:", error);
      toast.error("Greška pri izvozu cenovnika");
    }
  };

  return {
    exportCustomers,
    exportProducts
  };
};