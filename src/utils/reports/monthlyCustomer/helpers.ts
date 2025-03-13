
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomerSalesData } from "./types";

/**
 * Get the current month date range
 */
export function getMonthDateRange() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
  console.log(`Generating report for month: ${firstDayOfMonth.toLocaleDateString('sr-RS')} to ${firstDayOfNextMonth.toLocaleDateString('sr-RS')}`);
  
  return {
    firstDayOfMonth,
    firstDayOfNextMonth,
    today
  };
}

/**
 * Format filename with current month and year
 */
export function formatFilename() {
  const today = new Date();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();
  
  // Format: MesecniIzvestajKupci-MM-YYYY
  return `MesecniIzvestajKupci-${month}-${year}`;
}

/**
 * Fetch sales data for the current month without using relationships
 * This avoids the "Could not embed" error by using a flat query
 */
export async function fetchMonthlySalesData(userId: string, startDate: Date, endDate: Date) {
  toast.info("Učitavanje podataka za trenutni mesec...");

  try {
    console.log(`Fetching sales data between ${startDate.toISOString()} and ${endDate.toISOString()}`);
    
    // Use a basic query without any joins or relationships
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    if (error) {
      console.error("Error fetching sales data:", error);
      throw new Error(`Greška pri učitavanju prodaje: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error("Nema prodaje za trenutni mesec");
    }

    console.log(`Found ${data.length} sales for current month`);
    return data;
  } catch (error) {
    console.error("Error in fetchMonthlySalesData:", error);
    throw error;
  }
}

/**
 * Process sales data into customer sales summary
 * Gets customer data with separate queries to avoid relationship issues
 */
export async function processCustomerSalesData(salesData: any[]): Promise<Record<string, CustomerSalesData>> {
  toast.info("Obrađivanje podataka za mesečni izveštaj...");
  
  try {
    // Create object to store customer sales data
    const customerSales: Record<string, CustomerSalesData> = {};
    
    // Extract unique customer IDs (both regular and Darko)
    const customerIds = new Set<string>();
    const darkoCustomerIds = new Set<string>();
    
    // Process each sale to collect unique customer IDs
    salesData.forEach(sale => {
      if (sale.customer_id) customerIds.add(sale.customer_id);
      if (sale.darko_customer_id) darkoCustomerIds.add(sale.darko_customer_id);
    });
    
    console.log(`Found ${customerIds.size} unique regular customers and ${darkoCustomerIds.size} unique Darko customers`);
    
    // Fetch regular customer data
    const regularCustomers: Record<string, any> = {};
    if (customerIds.size > 0) {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, pib, address, city')
        .in('id', Array.from(customerIds));
      
      if (error) {
        console.error("Error fetching regular customers:", error);
      } else if (data) {
        data.forEach(customer => {
          regularCustomers[customer.id] = customer;
        });
      }
    }
    
    // Fetch Darko customer data
    const darkoCustomers: Record<string, any> = {};
    if (darkoCustomerIds.size > 0) {
      const { data, error } = await supabase
        .from('kupci_darko')
        .select('id, name, pib, address, city')
        .in('id', Array.from(darkoCustomerIds));
      
      if (error) {
        console.error("Error fetching Darko customers:", error);
      } else if (data) {
        data.forEach(customer => {
          darkoCustomers[customer.id] = customer;
        });
      }
    }
    
    // Process sales data with customer information
    salesData.forEach(sale => {
      let customerId = null;
      let customer = null;
      
      // Determine customer source (regular or Darko)
      if (sale.customer_id) {
        customerId = sale.customer_id;
        customer = regularCustomers[customerId];
      } else if (sale.darko_customer_id) {
        customerId = sale.darko_customer_id;
        customer = darkoCustomers[customerId];
      }
      
      if (!customerId || !customer) {
        console.warn(`No valid customer found for sale ${sale.id}`);
        return; // Skip this sale
      }
      
      // Initialize customer data if not already done
      if (!customerSales[customerId]) {
        customerSales[customerId] = {
          customerInfo: {
            name: customer.name || 'Nepoznat',
            pib: customer.pib || '',
            address: customer.address || '',
            city: customer.city || ''
          },
          sales: [],
          cashTotal: 0,
          invoiceTotal: 0
        };
      }
      
      // Add sale to customer's records
      customerSales[customerId].sales.push(sale);
      
      // Update totals based on payment type
      const saleTotal = parseFloat(sale.total) || 0;
      if (sale.payment_type === 'cash') {
        customerSales[customerId].cashTotal += saleTotal;
      } else {
        customerSales[customerId].invoiceTotal += saleTotal;
      }
    });
    
    console.log(`Processed data for ${Object.keys(customerSales).length} customers`);
    return customerSales;
  } catch (error) {
    console.error("Error processing customer sales data:", error);
    throw error;
  }
}

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
