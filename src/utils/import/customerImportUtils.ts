import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImportCustomer {
  code?: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  pib: string;
  is_vat_registered?: boolean;
  gps_coordinates?: string;
  group_name?: string;
  naselje?: string;
  email?: string;
}

export const processCustomerData = async (customer: ImportCustomer, userId: string) => {
  try {
    const customerData = {
      user_id: userId,
      code: customer.code || Date.now().toString().slice(-6),
      name: customer.name,
      address: customer.address,
      city: customer.city,
      phone: customer.phone || '',
      pib: customer.pib,
      is_vat_registered: customer.is_vat_registered || false,
      gps_coordinates: customer.gps_coordinates || '',
      group_name: customer.group_name || null,
      naselje: customer.naselje || null,
      email: customer.email || null
    };

    // Check for existing customer with same code to prevent duplicates
    const { data: existingCustomer } = await supabase
      .from('kupci_darko')
      .select('id')
      .eq('user_id', userId)
      .eq('code', customerData.code)
      .single();

    if (existingCustomer) {
      // Update existing customer
      const { error } = await supabase
        .from('kupci_darko')
        .update(customerData)
        .eq('id', existingCustomer.id);

      if (error) throw error;
    } else {
      // Insert new customer
      const { error } = await supabase
        .from('kupci_darko')
        .insert(customerData);

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error processing customer:', error);
    return false;
  }
};