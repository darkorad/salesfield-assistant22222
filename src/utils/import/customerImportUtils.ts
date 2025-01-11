import { supabase } from "@/integrations/supabase/client";

export interface ImportCustomer {
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

export const processCustomerData = async (rawData: unknown, userId: string) => {
  try {
    // Type guard to validate the raw data
    const isValidCustomer = (data: any): data is ImportCustomer => {
      return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.name === 'string' &&
        typeof data.address === 'string' &&
        typeof data.city === 'string' &&
        typeof data.pib === 'string'
      );
    };

    if (!isValidCustomer(rawData)) {
      console.error('Invalid customer data format:', rawData);
      return false;
    }

    const customerData = {
      user_id: userId,
      code: rawData.code || Date.now().toString().slice(-6),
      name: rawData.name,
      address: rawData.address,
      city: rawData.city,
      phone: rawData.phone || '',
      pib: rawData.pib,
      is_vat_registered: rawData.is_vat_registered || false,
      gps_coordinates: rawData.gps_coordinates || '',
      group_name: rawData.group_name || null,
      naselje: rawData.naselje || null,
      email: rawData.email || null
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