import { supabase } from "@/integrations/supabase/client";

export interface ImportCustomer {
  code?: string;
  name: string;           // Required
  address: string;        // Required
  city: string;          // Required
  phone?: string;
  pib: string;           // Required
  is_vat_registered?: boolean;
  gps_coordinates?: string;
  group_name?: string;
  naselje?: string;
  email?: string;
}

export const processCustomerData = async (rawData: unknown, userId: string) => {
  try {
    // Type guard to validate the raw data with detailed error messages
    const isValidCustomer = (data: any): data is ImportCustomer => {
      if (typeof data !== 'object' || data === null) {
        console.error('Invalid data format: not an object');
        return false;
      }

      // Map Excel column names to our field names
      if (data.Naziv) data.name = data.Naziv;
      if (data.Adresa) data.address = data.Adresa;
      if (data.Grad) data.city = data.Grad;
      if (data.Telefon) data.phone = data.Telefon;
      if (data.PIB) data.pib = data.PIB;
      if (data.Grupa) data.group_name = data.Grupa;
      if (data.Naselje) data.naselje = data.Naselje;
      if (data.Email) data.email = data.Email;

      const requiredFields = {
        name: 'string',
        address: 'string',
        city: 'string',
        pib: 'string'
      };

      for (const [field, type] of Object.entries(requiredFields)) {
        if (!data[field] || typeof data[field] !== type || !data[field].toString().trim()) {
          console.error(`Missing or invalid required field: ${field}`);
          return false;
        }
      }

      return true;
    };

    if (!isValidCustomer(rawData)) {
      console.error('Preskočen kupac zbog nedostajućih obaveznih polja:', rawData);
      return false;
    }

    const customerData = {
      user_id: userId,
      code: rawData.code?.toString().trim() || Date.now().toString().slice(-6),
      name: rawData.name.trim(),
      address: rawData.address.trim(),
      city: rawData.city.trim(),
      phone: rawData.phone?.toString().trim() || '',
      pib: rawData.pib.toString().trim(),
      is_vat_registered: rawData.is_vat_registered || false,
      gps_coordinates: rawData.gps_coordinates?.toString().trim() || '',
      group_name: rawData.group_name?.toString().trim() || null,
      naselje: rawData.naselje?.toString().trim() || null,
      email: rawData.email?.toString().trim() || null
    };

    // Check for existing customer with same PIB to prevent duplicates
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .eq('pib', customerData.pib)
      .maybeSingle();

    if (existingCustomer) {
      // Update existing customer
      const { error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', existingCustomer.id);

      if (error) throw error;
    } else {
      // Insert new customer
      const { error } = await supabase
        .from('customers')
        .insert(customerData);

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error processing customer:', error);
    return false;
  }
};