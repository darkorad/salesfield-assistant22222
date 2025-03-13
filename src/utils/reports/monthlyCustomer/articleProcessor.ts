
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Process sales data to summarize article sales
 * Groups articles and sorts them by total value
 */
export async function processMonthlySalesByArticle(salesData: any[]) {
  toast.info("Obrađivanje podataka po artiklima...");
  
  try {
    // Create object to store article sales data
    const articleSales: Record<string, {
      name: string,
      manufacturer: string,
      unit: string,
      totalQuantity: number,
      totalValue: number,
      customers: Set<string>
    }> = {};
    
    // Cache for customer names to avoid multiple lookups
    const customerNames: Record<string, string> = {};
    
    // Process each sale
    for (const sale of salesData) {
      // Get customer name
      let customerId = sale.customer_id || sale.darko_customer_id;
      let customerName = 'Nepoznat kupac';
      
      if (customerId) {
        // Check if we already have this customer's name cached
        if (customerNames[customerId]) {
          customerName = customerNames[customerId];
        } else {
          // Try to fetch from customers table
          if (sale.customer_id) {
            const { data } = await supabase
              .from('customers')
              .select('name')
              .eq('id', customerId)
              .single();
            
            if (data) {
              customerName = data.name;
              customerNames[customerId] = customerName;
            }
          } 
          // Try to fetch from kupci_darko table
          else if (sale.darko_customer_id) {
            const { data } = await supabase
              .from('kupci_darko')
              .select('name')
              .eq('id', customerId)
              .single();
            
            if (data) {
              customerName = data.name;
              customerNames[customerId] = customerName;
            }
          }
        }
      }
      
      // Process items in the sale
      const items = sale.items || [];
      for (const item of items) {
        if (!item.product) continue;
        
        const product = item.product;
        const productName = product.Naziv || '';
        const manufacturer = product.Proizvođač || '';
        const unit = product["Jedinica mere"] || '';
        const price = parseFloat(product.Cena) || 0;
        const quantity = parseFloat(item.quantity) || 0;
        
        // Create unique key for the article
        const key = `${productName}_${manufacturer}_${unit}`;
        
        // Initialize article data if needed
        if (!articleSales[key]) {
          articleSales[key] = {
            name: productName,
            manufacturer: manufacturer,
            unit: unit,
            totalQuantity: 0,
            totalValue: 0,
            customers: new Set()
          };
        }
        
        // Update article data
        articleSales[key].totalQuantity += quantity;
        articleSales[key].totalValue += quantity * price;
        articleSales[key].customers.add(customerName);
      }
    }
    
    // Convert to array and sort by total value (descending)
    const result = Object.values(articleSales)
      .sort((a, b) => b.totalValue - a.totalValue)
      .map(article => ({
        'Naziv artikla': article.name,
        'Proizvođač': article.manufacturer,
        'Jedinica mere': article.unit,
        'Kupci': Array.from(article.customers).join(', '),
        'Ukupna količina': parseFloat(article.totalQuantity.toFixed(2)),
        'Ukupna vrednost': parseFloat(article.totalValue.toFixed(2))
      }));
    
    console.log(`Processed ${result.length} unique articles`);
    return result;
  } catch (error) {
    console.error("Error processing sales by article:", error);
    throw error;
  }
}
