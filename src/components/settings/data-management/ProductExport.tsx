
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

export const ProductExport = () => {
  const handleExportPrices = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const userEmail = session.user.email;
      
      // Get products data
      let productsResponse;
      if (userEmail === 'zirmd.darko@gmail.com') {
        productsResponse = await supabase
          .from('products_darko')
          .select('*')
          .not('Naziv', 'eq', '');
      } else {
        productsResponse = await supabase
          .from('products_darko')
          .select('*')
          .eq('user_id', session.user.id)
          .not('Naziv', 'eq', '');
      }

      if (productsResponse.error) {
        console.error('Error fetching products:', productsResponse.error);
        toast.error("Greška pri preuzimanju podataka o proizvodima");
        return;
      }

      // Get group pricing data
      const { data: groupPrices, error: groupPricesError } = await supabase
        .from('price_changes')
        .select('group_id, product_id, invoice_price, cash_price')
        .not('group_id', 'is', null);

      if (groupPricesError) {
        console.error('Error fetching group prices:', groupPricesError);
        toast.error("Greška pri preuzimanju cena za grupe");
        return;
      }

      // Get customer groups
      const { data: groups, error: groupsError } = await supabase
        .from('customer_groups')
        .select('id, name');

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        toast.error("Greška pri preuzimanju grupa");
        return;
      }

      // Map group IDs to names
      const groupMap = new Map();
      groups?.forEach(group => {
        groupMap.set(group.id, group.name);
      });

      // Format product data
      const products = productsResponse.data || [];
      if (!products || products.length === 0) {
        toast.error("Nema podataka o proizvodima");
        return;
      }

      // Prepare standard product data
      const standardProducts = products.map(product => ({
        name: product.Naziv,
        manufacturer: product.Proizvođač,
        price: product.Cena,
        unit: product["Jedinica mere"],
        type: "standard" // Indicates standard product pricing
      }));

      // Prepare group pricing data
      const groupPricingData = [];
      groupPrices?.forEach(price => {
        const product = products.find(p => p.id === price.product_id);
        if (product && price.group_id) {
          const groupName = groupMap.get(price.group_id) || 'Unknown Group';
          groupPricingData.push({
            name: product.Naziv,
            manufacturer: product.Proizvođač,
            price: product.Cena, // Original price
            unit: product["Jedinica mere"],
            group: groupName,
            invoice_price: price.invoice_price,
            cash_price: price.cash_price,
            type: "group" // Indicates group pricing
          });
        }
      });

      // Combine standard products and group pricing
      const exportData = [...standardProducts, ...groupPricingData];

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Cenovnik");
      
      // Set column widths
      const colWidths = [
        { wch: 30 }, // name
        { wch: 20 }, // manufacturer
        { wch: 15 }, // price
        { wch: 10 }, // unit
        { wch: 20 }, // group (if present)
        { wch: 15 }, // invoice_price (if present)
        { wch: 15 }, // cash_price (if present)
        { wch: 10 }, // type
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `cenovnik.xlsx`);
      toast.success("Cenovnik je uspešno izvezen");
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error("Greška pri izvozu cenovnika");
    }
  };

  return (
    <Button
      className="w-full py-6 text-lg font-medium"
      onClick={handleExportPrices}
    >
      <FileSpreadsheet className="mr-2 h-5 w-5" />
      Izvezi cenovnik
    </Button>
  );
};
