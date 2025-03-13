
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
 * Fetch sales data for the current month without using any joins or relationships
 */
export async function fetchMonthlySalesData(userId: string, startDate: Date, endDate: Date) {
  toast.info("Učitavanje podataka za trenutni mesec...");

  try {
    // Basic query with no relationships at all
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lt('date', endDate.toISOString());

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
 * Process sales data into customer sales summary using separate queries 
 * for customer data to avoid relationship issues
 */
export async function processCustomerSalesData(salesData: any[]): Promise<Record<string, CustomerSalesData>> {
  toast.info("Obrađivanje podataka za mesečni izveštaj...");
  
  try {
    // Create map to store customer data
    const customerMap: Record<string, any> = {};
    
    // Extract unique customer IDs and darko customer IDs
    const customerIds: string[] = [];
    const darkoCustomerIds: string[] = [];
    
    salesData.forEach(sale => {
      if (sale.customer_id && !customerIds.includes(sale.customer_id)) {
        customerIds.push(sale.customer_id);
      }
      if (sale.darko_customer_id && !darkoCustomerIds.includes(sale.darko_customer_id)) {
        darkoCustomerIds.push(sale.darko_customer_id);
      }
    });
    
    console.log(`Found ${customerIds.length} regular customers and ${darkoCustomerIds.length} Darko customers`);
    
    // Fetch all regular customers in a single query
    if (customerIds.length > 0) {
      try {
        const { data: customers, error } = await supabase
          .from('customers')
          .select('id, name, pib, address, city')
          .in('id', customerIds);
        
        if (error) {
          console.error("Error fetching customers:", error);
        } else if (customers) {
          customers.forEach(customer => {
            customerMap[customer.id] = {
              type: 'regular',
              ...customer
            };
          });
        }
      } catch (err) {
        console.error("Error in customer fetch:", err);
      }
    }
    
    // Fetch all Darko customers in a single query
    if (darkoCustomerIds.length > 0) {
      try {
        const { data: darkoCustomers, error } = await supabase
          .from('kupci_darko')
          .select('id, name, pib, address, city')
          .in('id', darkoCustomerIds);
        
        if (error) {
          console.error("Error fetching Darko customers:", error);
        } else if (darkoCustomers) {
          darkoCustomers.forEach(customer => {
            customerMap[customer.id] = {
              type: 'darko',
              ...customer
            };
          });
        }
      } catch (err) {
        console.error("Error in Darko customer fetch:", err);
      }
    }
    
    // Create customer sales summary
    const customerSales: Record<string, CustomerSalesData> = {};
    
    // Process each sale
    salesData.forEach(sale => {
      const customerId = sale.customer_id || sale.darko_customer_id;
      
      if (!customerId) {
        console.warn(`Sale ${sale.id} has no customer ID`);
        return;
      }
      
      const customer = customerMap[customerId];
      
      if (!customer) {
        console.warn(`No customer data found for ID: ${customerId}`);
        return;
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
      
      // Add the sale
      customerSales[customerId].sales.push(sale);
      
      // Update totals based on payment type
      if (sale.payment_type === 'cash') {
        customerSales[customerId].cashTotal += parseFloat(sale.total) || 0;
      } else {
        customerSales[customerId].invoiceTotal += parseFloat(sale.total) || 0;
      }
    });
    
    return customerSales;
  } catch (error) {
    console.error("Error in processCustomerSalesData:", error);
    throw error;
  }
}
