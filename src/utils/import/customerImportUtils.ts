
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ImportCustomer {
  code?: string;
  name: string;           
  address: string;        
  city: string;          
  phone?: string;
  pib: string;           
  is_vat_registered?: boolean | string;
  gps_coordinates?: string;
  group_name?: string;
  naselje?: string;
  email?: string;
  dan_posete?: string;
  dan_obilaska?: string;
  visit_day?: string;
}

export const processCustomerData = async (rawData: unknown, userId: string) => {
  try {
    console.log("Processing customer data:", rawData);
    
    // First, identify all possible day field names from the imported data
    const possibleDayFields = ['dan_posete', 'Dan posete', 'Dan_posete', 'dan posete', 
                              'dan_obilaska', 'Dan obilaska', 'Dan_obilaska', 'dan obilaska',
                              'visit_day', 'Visit day', 'Visit_day', 'visit day'];
    
    // Map Excel column names to our field names with extended column name matching
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
      is_vat_registered: ((rawData as any)["PDV Obveznik"] === "DA" || 
                         (rawData as any).is_vat_registered === "DA" || 
                         (rawData as any).is_vat_registered === true),
      gps_coordinates: (rawData as any)["GPS Koordinate"] || (rawData as any).gps_coordinates,
      code: (rawData as any)["Šifra kupca"] || (rawData as any).code
    };
    
    // Extract day values from any matching field names
    // Check each possible day field and use the first non-empty one found
    let dayValue = null;
    for (const field of possibleDayFields) {
      if ((rawData as any)[field] && (rawData as any)[field].toString().trim() !== '') {
        dayValue = (rawData as any)[field].toString().trim().toLowerCase();
        console.log(`Found day value in field ${field}: ${dayValue}`);
        break;
      }
    }
    
    // Directly look for dan_posete column as shown in the image
    if ((rawData as any)["dan_posete"] !== undefined) {
      data.dan_posete = (rawData as any)["dan_posete"].toString().trim().toLowerCase();
      console.log(`Found dan_posete field with value: ${data.dan_posete}`);
    }
    
    // Also check for other variants of the same field
    if (!data.dan_posete && (rawData as any)["Dan posete"] !== undefined) {
      data.dan_posete = (rawData as any)["Dan posete"].toString().trim().toLowerCase();
      console.log(`Found Dan posete field with value: ${data.dan_posete}`);
    }
    
    // Ensure all day fields are populated if at least one is found
    if (data.dan_posete) {
      data.dan_obilaska = data.dan_obilaska || data.dan_posete;
      data.visit_day = data.visit_day || data.dan_posete;
    } else if (data.dan_obilaska) {
      data.dan_posete = data.dan_posete || data.dan_obilaska;
      data.visit_day = data.visit_day || data.dan_obilaska;
    } else if (data.visit_day) {
      data.dan_posete = data.dan_posete || data.visit_day;
      data.dan_obilaska = data.dan_obilaska || data.visit_day;
    } else if (dayValue) {
      // Use the found day value for all day fields
      data.dan_posete = dayValue;
      data.dan_obilaska = dayValue;
      data.visit_day = dayValue;
      console.log(`Using found day value for all day fields: ${dayValue}`);
    }
    
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
    
    // Normalize day data to ensure consistency
    if (data.dan_posete) {
      // Clean and normalize the day value
      const normalized = normalizeDay(data.dan_posete);
      data.dan_posete = normalized;
      console.log(`Normalized dan_posete for ${data.name}: ${data.dan_posete}`);
    }
    
    if (data.dan_obilaska) {
      const normalized = normalizeDay(data.dan_obilaska);
      data.dan_obilaska = normalized;
      console.log(`Normalized dan_obilaska for ${data.name}: ${data.dan_obilaska}`);
    }
    
    if (data.visit_day) {
      const normalized = normalizeDay(data.visit_day);
      data.visit_day = normalized;
      console.log(`Normalized visit_day for ${data.name}: ${data.visit_day}`);
    }

    console.log(`Final day fields for customer ${data.name}:`, {
      dan_posete: data.dan_posete,
      dan_obilaska: data.dan_obilaska,
      visit_day: data.visit_day
    });

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
      dan_obilaska: data.dan_obilaska || null,
      visit_day: data.visit_day || null
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

// Helper function to normalize day names
const normalizeDay = (day: string): string => {
  if (!day) return '';
  
  const dayStr = day.toString().toLowerCase().trim();
  
  // Map of common abbreviations and variations to standard day names
  const dayMap: Record<string, string> = {
    'pon': 'ponedeljak',
    'poned': 'ponedeljak',
    'ponedeljak': 'ponedeljak',
    'monday': 'ponedeljak',
    'mon': 'ponedeljak',
    
    'uto': 'utorak',
    'utorak': 'utorak',
    'tuesday': 'utorak',
    'tue': 'utorak',
    
    'sre': 'sreda',
    'sreda': 'sreda',
    'wednesday': 'sreda',
    'wed': 'sreda',
    
    'čet': 'četvrtak',
    'cet': 'četvrtak',
    'cetvrtak': 'četvrtak',
    'četvrtak': 'četvrtak',
    'thursday': 'četvrtak',
    'thu': 'četvrtak',
    
    'pet': 'petak',
    'petak': 'petak',
    'friday': 'petak',
    'fri': 'petak',
    
    'sub': 'subota',
    'subota': 'subota',
    'saturday': 'subota',
    'sat': 'subota',
    
    'ned': 'nedelja',
    'nedelja': 'nedelja',
    'sunday': 'nedelja',
    'sun': 'nedelja'
  };
  
  // Check for exact matches
  if (dayMap[dayStr]) {
    return dayMap[dayStr];
  }
  
  // Check for partial matches
  for (const [abbr, fullDay] of Object.entries(dayMap)) {
    if (dayStr.includes(abbr)) {
      return fullDay;
    }
  }
  
  // If no match found, return the original lowercased value
  return dayStr;
};

