import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ItemSummary } from "./types";

/**
 * Get the month name in Serbian for a given date
 */
export function getMonthNameInSerbian(date: Date): string {
  const monthNames = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];
  return monthNames[date.getMonth()];
}

/**
 * Fetch sales data for the current month
 */
export async function fetchMonthlySalesData(userId: string, startDate: Date, endDate: Date) {
  toast.info("Učitavanje podataka o prodaji za tekući mesec...");

  // Use a simpler approach without specifying the foreign key constraint
  const { data: sales, error } = await supabase
    .from('sales')
    .select(`
      *,
      customers!sales_customer_id_fkey(*),
      kupci_darko!sales_darko_customer_id_fkey(*)
    `)
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lt('created_at', endDate.toISOString());

  if (error) {
    console.error('Error fetching sales:', error);
    throw new Error(`Greška pri učitavanju prodaje: ${error.message}`);
  }

  if (!sales || sales.length === 0) {
    throw new Error("Nema prodaje za tekući mesec");
  }

  console.log(`Found ${sales.length} sales for current month`);
  return sales;
}

/**
 * Process sales data into item summaries
 */
export function processSalesData(sales: any[]): Record<string, ItemSummary> {
  toast.info("Obrada podataka...");
  
  const itemsSummary: Record<string, ItemSummary> = {};
  
  sales.forEach(sale => {
    // Get customer name
    const customerName = sale.customers?.name || sale.kupci_darko?.name || 'Nepoznat kupac';
    
    // Ensure items is an array
    const items = Array.isArray(sale.items) ? sale.items : [];
    
    items.forEach(item => {
      if (!item.product) return;
      const product = item.product;
      
      // Use consistent property access - note that property names may vary
      const productName = product.Naziv || product.naziv || product.name || 'Nepoznat';
      const manufacturer = product.Proizvođač || product.proizvođač || product.manufacturer || 'Nepoznat';
      const unitStr = product["Jedinica mere"] || product.jedinicaMere || product.unit || '1';
      const price = parseFloat(product.Cena || product.cena || product.price || 0);
      
      // Parse unit value - ensure it's a number for calculation
      const unitValue = parseFloat(unitStr) || 1; 
      
      const key = `${productName}_${manufacturer}_${unitStr}`;
      
      if (!itemsSummary[key]) {
        itemsSummary[key] = {
          name: productName,
          manufacturer: manufacturer,
          unit: unitStr,
          totalQuantity: 0,
          totalValue: 0,
          customers: new Set()
        };
      }
      
      const quantity = parseFloat(item.quantity) || 0;
      // Calculate value correctly: quantity * unitValue * price
      const value = quantity * unitValue * price;
      
      itemsSummary[key].totalQuantity += quantity;
      itemsSummary[key].totalValue += value;
      itemsSummary[key].customers.add(customerName);
    });
  });

  console.log(`Processed ${Object.keys(itemsSummary).length} unique products`);
  return itemsSummary;
}
