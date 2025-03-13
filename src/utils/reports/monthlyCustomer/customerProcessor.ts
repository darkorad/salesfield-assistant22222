
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomerSalesData } from "./types";

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
