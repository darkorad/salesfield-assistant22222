import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    // Map Excel column names to our field names
    const data = {
      ...rawData as any,
      name: (rawData as any).Naziv || (rawData as any).name,
      address: (rawData as any).Adresa || (rawData as any).address,
      city: (rawData as any).Grad || (rawData as any).city,
      phone: (rawData as any).Telefon || (rawData as any).phone,
      pib: (rawData as any).PIB || (rawData as any).pib,
      group_name: (rawData as any).Grupa || (rawData as any).group_name,
      naselje: (rawData as any).Naselje || (rawData as any).naselje,
      email: (rawData as any).Email || (rawData as any).email,
      is_vat_registered: ((rawData as any)["PDV Obveznik"] === "DA" || (rawData as any).is_vat_registered === true),
      gps_coordinates: (rawData as any)["GPS Koordinate"] || (rawData as any).gps_coordinates
    };

    // Validate required fields
    if (!data.name?.trim()) {
      console.error('Missing required field: name', data);
      return false;
    }

    // Generate default values for missing required fields
    if (!data.address?.trim()) {
      data.address = data.city || "Nepoznata adresa";
      console.log(`Generated default address for ${data.name}`);
    }

    if (!data.city?.trim()) {
      data.city = "Beograd";
      console.log(`Generated default city for ${data.name}`);
    }

    if (!data.pib?.trim()) {
      data.pib = `TEMP-${Date.now()}`;
      console.log(`Generated temporary PIB for ${data.name}`);
    }

    const customerData = {
      user_id: userId,
      code: data.code?.toString().trim() || Date.now().toString().slice(-6),
      name: data.name.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      phone: data.phone?.toString().trim() || '',
      pib: data.pib.toString().trim(),
      is_vat_registered: data.is_vat_registered || false,
      gps_coordinates: data.gps_coordinates?.toString().trim() || '',
      group_name: data.group_name?.toString().trim() || null,
      naselje: data.naselje?.toString().trim() || null,
      email: data.email?.toString().trim() || null
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

      if (error) {
        console.error('Error updating customer:', error);
        return false;
      }
    } else {
      // Insert new customer
      const { error } = await supabase
        .from('customers')
        .insert(customerData);

      if (error) {
        console.error('Error inserting customer:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error processing customer:', error);
    return false;
  }
};