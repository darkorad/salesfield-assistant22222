
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
 * Fetch sales data for the current month
 * Using a completely flat query structure to avoid relationship ambiguity
 */
export async function fetchMonthlySalesData(userId: string, startDate: Date, endDate: Date) {
  toast.info("Učitavanje podataka za trenutni mesec...");

  // Simple flat query with no joins or relationships
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
 */
export async function processCustomerSalesData(salesData: any[]): Promise<Record<string, CustomerSalesData>> {
  toast.info("Obrađivanje podataka za mesečni izveštaj...");

  // Create a map to store fetched customer data to avoid duplicate requests
  const customersMap: Map<string, any> = new Map();
  
  // Customer sales summary by customer ID
  const customerSales: Record<string, CustomerSalesData> = {};

  // First pass: fetch all unique customer data
  const uniqueCustomerIds = new Set<string>();
  const uniqueDarkoCustomerIds = new Set<string>();
  
  // Collect unique IDs
  salesData.forEach(sale => {
    if (sale.customer_id) uniqueCustomerIds.add(sale.customer_id);
    if (sale.darko_customer_id) uniqueDarkoCustomerIds.add(sale.darko_customer_id);
  });
  
  // Batch fetch regular customers
  if (uniqueCustomerIds.size > 0) {
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, pib, address, city')
      .in('id', Array.from(uniqueCustomerIds));
      
    if (customers) {
      customers.forEach(customer => {
        customersMap.set(customer.id, customer);
      });
    }
  }
  
  // Batch fetch Darko customers
  if (uniqueDarkoCustomerIds.size > 0) {
    const { data: darkoCustomers } = await supabase
      .from('kupci_darko')
      .select('id, name, pib, address, city')
      .in('id', Array.from(uniqueDarkoCustomerIds));
      
    if (darkoCustomers) {
      darkoCustomers.forEach(customer => {
        customersMap.set(customer.id, customer);
      });
    }
  }

  // Second pass: group sales by customer
  salesData.forEach(sale => {
    // Determine which customer ID to use
    const customerId = sale.customer_id || sale.darko_customer_id;
    if (!customerId || !customersMap.has(customerId)) {
      console.warn(`No customer found for sale ${sale.id}`);
      return;
    }
    
    const customer = customersMap.get(customerId);
    
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
    
    // Update totals
    if (sale.payment_type === 'cash') {
      customerSales[customerId].cashTotal += sale.total;
    } else {
      customerSales[customerId].invoiceTotal += sale.total;
    }
  });

  return customerSales;
}
