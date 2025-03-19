
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Fetches sales data for the current day from Supabase
 */
export const fetchDailySalesData = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log(`Generating report for date range: ${today.toISOString()} to ${tomorrow.toISOString()}`);

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return null;
    }

    toast.info("Učitavanje podataka za današnji dan...");

    // First get sales data without trying to join with customers
    const { data: salesData, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString())
      .order('date', { ascending: true });

    if (error) {
      console.error("Error loading sales:", error);
      toast.error(`Greška pri učitavanju prodaje: ${error.message}`);
      return null;
    }

    if (!salesData || salesData.length === 0) {
      toast.error("Nema prodaje za današnji dan");
      return null;
    }

    // Now fetch customer data separately based on user email
    let customerData = [];
    
    // Get customers data based on user
    if (session.user.email === 'zirmd.darko@gmail.com') {
      const { data: darkoCustomers } = await supabase
        .from('kupci_darko')
        .select('*')
        .eq('user_id', session.user.id);
      
      customerData = darkoCustomers || [];
    } else {
      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', session.user.id);
      
      customerData = customers || [];
    }
    
    // Create a map for quick customer lookup
    const customerMap = new Map();
    customerData.forEach(customer => {
      customerMap.set(customer.id, customer);
    });
    
    // Merge customer data with sales data
    const salesWithCustomers = salesData.map(sale => {
      let customer = null;
      let darkoCustomer = null;
      
      if (sale.customer_id) {
        customer = customerMap.get(sale.customer_id);
      }
      
      if (sale.darko_customer_id) {
        darkoCustomer = customerMap.get(sale.darko_customer_id);
      }
      
      return {
        ...sale,
        customer,
        darko_customer: darkoCustomer
      };
    });

    console.log("All sales for selected date:", salesWithCustomers.length, salesWithCustomers.map(sale => ({
      id: sale.id,
      customer_id: sale.customer_id,
      darko_customer_id: sale.darko_customer_id,
      customer_name: getCustomerName(sale.customer, sale.darko_customer),
      items: sale.items ? (sale.items as any[]).length : 0,
      itemsPaymentTypes: sale.items ? (sale.items as any[]).map(item => item.paymentType) : []
    })));

    return salesWithCustomers;
  } catch (error) {
    console.error("Error fetching sales data:", error);
    toast.error(`Greška pri učitavanju podataka: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

/**
 * Helper function to safely extract customer name
 */
export function getCustomerName(customer: any, darkoCustomer: any): string {
  if (customer && typeof customer === 'object' && !Array.isArray(customer) && customer.name) {
    return customer.name;
  }
  
  if (darkoCustomer && typeof darkoCustomer === 'object' && !Array.isArray(darkoCustomer) && darkoCustomer.name) {
    return darkoCustomer.name;
  }
  
  return 'Nepoznat';
}

/**
 * Helper function to safely extract customer data
 */
export function extractCustomerData(customer: any, darkoCustomer: any) {
  // Default empty customer data
  const defaultCustomer = {
    name: 'Nepoznat kupac',
    pib: '',
    address: '',
    city: ''
  };
  
  // Check if customer is a valid object with required properties
  if (customer && typeof customer === 'object' && !Array.isArray(customer) && customer.name) {
    return {
      name: customer.name || defaultCustomer.name,
      pib: customer.pib || defaultCustomer.pib,
      address: customer.address || defaultCustomer.address,
      city: customer.city || defaultCustomer.city
    };
  }
  
  // Check if darkoCustomer is a valid object with required properties
  if (darkoCustomer && typeof darkoCustomer === 'object' && !Array.isArray(darkoCustomer) && darkoCustomer.name) {
    return {
      name: darkoCustomer.name || defaultCustomer.name,
      pib: darkoCustomer.pib || defaultCustomer.pib,
      address: darkoCustomer.address || defaultCustomer.address,
      city: darkoCustomer.city || defaultCustomer.city
    };
  }
  
  // Return default if neither is valid
  return defaultCustomer;
}
