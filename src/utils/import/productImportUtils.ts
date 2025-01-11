import { supabase } from "@/integrations/supabase/client";

export interface ImportProduct {
  name: string;          // Required (Naziv)
  manufacturer: string;  // Required (Proizvođač)
  price: number;        // Required (Cena)
  unit: string;         // Required (Jedinica mere)
}

export const processProductData = async (rawData: unknown, userId: string) => {
  try {
    // Type guard to validate the raw data with detailed error messages
    const isValidProduct = (data: any): data is ImportProduct => {
      if (typeof data !== 'object' || data === null) {
        console.error('Invalid data format: not an object');
        return false;
      }

      const requiredFields = {
        name: 'string',
        manufacturer: 'string',
        price: 'number',
        unit: 'string'
      };

      for (const [field, type] of Object.entries(requiredFields)) {
        if (!data[field] || typeof data[field] !== type || 
           (type === 'string' && !data[field].trim())) {
          console.error(`Missing or invalid required field: ${field}`);
          return false;
        }
      }

      return true;
    };

    if (!isValidProduct(rawData)) {
      console.error('Preskočen proizvod zbog nedostajućih obaveznih polja:', rawData);
      return false;
    }

    const productData = {
      user_id: userId,
      Naziv: rawData.name.trim(),
      Proizvođač: rawData.manufacturer.trim(),
      Cena: rawData.price,
      "Jedinica mere": rawData.unit.trim(),
    };

    // Check for existing product to prevent duplicates
    const { data: existingProduct } = await supabase
      .from('products_darko')
      .select('id')
      .eq('user_id', userId)
      .eq('Naziv', productData.Naziv)
      .eq('Proizvođač', productData.Proizvođač)
      .maybeSingle();

    if (existingProduct) {
      // Update existing product
      const { error } = await supabase
        .from('products_darko')
        .update(productData)
        .eq('id', existingProduct.id);

      if (error) throw error;
    } else {
      // Insert new product
      const { error } = await supabase
        .from('products_darko')
        .insert(productData);

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error processing product:', error);
    return false;
  }
};