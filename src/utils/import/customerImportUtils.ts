
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
  dan_posete?: string;
  dan_obilaska?: string;
}

export const processCustomerData = async (rawData: unknown, userId: string) => {
  try {
    // Map Excel column names to our field names
    const data = {
      ...rawData as any,
      name: (rawData as any)["Naziv kupca"] || (rawData as any).Naziv || (rawData as any).name,
      address: (rawData as any).Adresa || (rawData as any).address,
      city: (rawData as any).Grad || (rawData as any).city,
      phone: (rawData as any).Telefon || (rawData as any).phone,
      pib: (rawData as any).PIB || (rawData as any).pib,
      group_name: (rawData as any).Grupa || (rawData as any).group_name,
      naselje: (rawData as any).Naselje || (rawData as any).naselje,
      email: (rawData as any).Email || (rawData as any).email,
      dan_posete: (rawData as any)["Dan posete"] || (rawData as any).dan_posete,
      dan_obilaska: (rawData as any)["Dan obilaska"] || (rawData as any).dan_obilaska,
      is_vat_registered: ((rawData as any)["PDV Obveznik"] === "DA" || (rawData as any).is_vat_registered === true),
      gps_coordinates: (rawData as any)["GPS Koordinate"] || (rawData as any).gps_coordinates,
      code: (rawData as any)["Šifra kupca"] || (rawData as any).code
    };

    // Extract name from object if it's in that format
    if (data.name && typeof data.name === 'object' && 'value' in data.name) {
      data.name = (data.name as any).value || '';
    }

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

    // Normalize dan_posete and dan_obilaska to lowercase
    if (data.dan_posete) {
      data.dan_posete = data.dan_posete.toLowerCase().trim();
    }
    if (data.dan_obilaska) {
      data.dan_obilaska = data.dan_obilaska.toLowerCase().trim();
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
      email: data.email?.toString().trim() || null,
      dan_posete: data.dan_posete || null,
      dan_obilaska: data.dan_obilaska || null
    };

    // First try to find if a customer with this code already exists
    const { data: existingCustomer } = await supabase
      .from('kupci_darko')
      .select('id')
      .eq('user_id', userId)
      .eq('code', customerData.code)
      .maybeSingle();

    if (existingCustomer) {
      // Update existing customer
      const { error: updateError } = await supabase
        .from('kupci_darko')
        .update(customerData)
        .eq('id', existingCustomer.id);

      if (updateError) {
        console.error('Error updating customer:', updateError);
        return false;
      }
    } else {
      // Generate a unique code if needed
      const timestamp = Date.now();
      customerData.code = `${timestamp.toString().slice(-6)}-${Math.random().toString(36).substring(7)}`;
      
      // Insert new customer
      const { error: insertError } = await supabase
        .from('kupci_darko')
        .insert(customerData);

      if (insertError) {
        console.error('Error inserting customer:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error processing customer:', error);
    return false;
  }
};
