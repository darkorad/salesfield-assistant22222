
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
 * Fetch sales data for the current month - using a completely separate approach
 * to avoid relationship ambiguity problems
 */
export async function fetchMonthlySalesData(userId: string, startDate: Date, endDate: Date) {
  toast.info("Učitavanje podataka za trenutni mesec...");

  // Use a simple query with no joins at all - just get the raw sales data
  const { data: salesData, error } = await supabase
    .from('sales')
    .select('id, date, total, items, customer_id, darko_customer_id, payment_type, created_at')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString())
    .lt('date', endDate.toISOString())
    .order('date', { ascending: true });

  if (error) {
    console.error("Error loading sales:", error);
    throw new Error(`Greška pri učitavanju prodaje: ${error.message}`);
  }

  if (!salesData || salesData.length === 0) {
    throw new Error("Nema prodaje za trenutni mesec");
  }

  console.log(`Found ${salesData.length} sales for current month`);
  return salesData;
}

/**
 * Process sales data into customer sales summary
 * This approach avoids relationship queries by fetching customer data separately
 */
export async function processCustomerSalesData(salesData: any[]): Promise<Record<string, CustomerSalesData>> {
  toast.info("Obrađivanje podataka za mesečni izveštaj...");

  // Create a map to store customer data
  const customersMap: Map<string, any> = new Map();
  
  // Customer sales summary by customer ID
  const customerSales: Record<string, CustomerSalesData> = {};

  // First collect all unique customer IDs
  const regularCustomerIds: string[] = [];
  const darkoCustomerIds: string[] = [];
  
  salesData.forEach(sale => {
    if (sale.customer_id && !regularCustomerIds.includes(sale.customer_id)) {
      regularCustomerIds.push(sale.customer_id);
    }
    if (sale.darko_customer_id && !darkoCustomerIds.includes(sale.darko_customer_id)) {
      darkoCustomerIds.push(sale.darko_customer_id);
    }
  });

  // Fetch regular customers in a single batch query if any exist
  if (regularCustomerIds.length > 0) {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id, name, pib, address, city')
      .in('id', regularCustomerIds);
      
    if (error) {
      console.error("Error fetching regular customers:", error);
      toast.error("Greška pri učitavanju kupaca");
    } else if (customers) {
      customers.forEach(customer => {
        customersMap.set(customer.id, customer);
      });
    }
  }
  
  // Fetch Darko customers in a single batch query if any exist
  if (darkoCustomerIds.length > 0) {
    const { data: darkoCustomers, error } = await supabase
      .from('kupci_darko')
      .select('id, name, pib, address, city')
      .in('id', darkoCustomerIds);
      
    if (error) {
      console.error("Error fetching Darko customers:", error);
      toast.error("Greška pri učitavanju Darko kupaca");
    } else if (darkoCustomers) {
      darkoCustomers.forEach(customer => {
        customersMap.set(customer.id, customer);
      });
    }
  }

  // Now process all sales with the customer data
  salesData.forEach(sale => {
    // Determine which customer ID to use
    const customerId = sale.customer_id || sale.darko_customer_id;
    if (!customerId) {
      console.warn(`No customer ID found for sale ${sale.id}`);
      return;
    }
    
    const customer = customersMap.get(customerId);
    if (!customer) {
      console.warn(`No customer data found for ID ${customerId}`);
      return;
    }
    
    // Initialize customer data if this is the first sale for this customer
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
      customerSales[customerId].cashTotal += sale.total;
    } else {
      customerSales[customerId].invoiceTotal += sale.total;
    }
  });

  return customerSales;
}
