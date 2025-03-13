
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomerSalesData } from "./types";

/**
 * Process sales data into customer sales summary
 * Uses the data already fetched with relationships
 */
export async function processCustomerSalesData(salesData: any[]): Promise<Record<string, CustomerSalesData>> {
  toast.info("Obrađivanje podataka za mesečni izveštaj...");
  
  try {
    // Create object to store customer sales data
    const customerSales: Record<string, CustomerSalesData> = {};
    
    // Process each sale with its already fetched customer data
    salesData.forEach(sale => {
      let customerId = null;
      let customer = null;
      
      // Determine customer source (regular or Darko)
      if (sale.customer_id && sale.customer) {
        customerId = sale.customer_id;
        customer = sale.customer;
      } else if (sale.darko_customer_id && sale.darko_customer) {
        customerId = sale.darko_customer_id;
        customer = sale.darko_customer;
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
