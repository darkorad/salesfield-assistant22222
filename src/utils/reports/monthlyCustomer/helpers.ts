
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
 */
export async function fetchMonthlySalesData(userId: string, startDate: Date, endDate: Date) {
  toast.info("Učitavanje podataka za trenutni mesec...");

  const { data: salesData, error } = await supabase
    .from('sales')
    .select(`
      id,
      date,
      total,
      items,
      payment_type,
      payment_status,
      manufacturer,
      customer_id,
      darko_customer_id
    `)
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

  // Create a map to store customer data
  const customersMap = new Map();
  
  // Customer sales summary by customer ID
  const customerSales: Record<string, CustomerSalesData> = {};
  
  // Fetch all customers data upfront
  for (const sale of salesData) {
    if (sale.customer_id && !customersMap.has(sale.customer_id)) {
      const { data } = await supabase
        .from('customers')
        .select('id, name, pib, address, city')
        .eq('id', sale.customer_id)
        .maybeSingle();
      
      if (data) {
        customersMap.set(sale.customer_id, data);
      }
    } else if (sale.darko_customer_id && !customersMap.has(sale.darko_customer_id)) {
      const { data } = await supabase
        .from('kupci_darko')
        .select('id, name, pib, address, city')
        .eq('id', sale.darko_customer_id)
        .maybeSingle();
      
      if (data) {
        customersMap.set(sale.darko_customer_id, data);
      }
    }
  }

  // Group sales by customer
  salesData.forEach(sale => {
    // Get customer from map using either ID
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
