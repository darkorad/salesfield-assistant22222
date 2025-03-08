
import { supabase } from "@/integrations/supabase/client";

export interface ImportProduct {
  name: string;          // Required (Naziv)
  manufacturer: string;  // Required (Proizvođač)
  price: number;        // Required (Cena)
  unit: string;         // Required (Jedinica mere)
}

export const processProductData = async (rawData: unknown, userId: string) => {
  try {
    // Map Excel column names to our field names
    const data = {
      ...rawData as any,
      name: (rawData as any).Naziv || (rawData as any).name,
      manufacturer: (rawData as any).Proizvođač || (rawData as any).manufacturer,
      price: (rawData as any).Cena || (rawData as any).price,
      unit: (rawData as any)["Jedinica mere"] || (rawData as any).unit
    };

    // Type guard to validate the data with detailed error messages
    const isValidProduct = (data: any): data is ImportProduct => {
      if (typeof data !== 'object' || data === null) {
        console.error('Invalid data format: not an object');
        return false;
      }

      if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
        console.error('Missing or invalid required field: name');
        return false;
      }

      if (!data.manufacturer || typeof data.manufacturer !== 'string' || !data.manufacturer.trim()) {
        console.error('Missing or invalid required field: manufacturer');
        return false;
      }

      if (data.price === undefined || isNaN(Number(data.price))) {
        console.error('Missing or invalid required field: price');
        return false;
      }

      if (!data.unit || typeof data.unit !== 'string' || !data.unit.trim()) {
        console.error('Missing or invalid required field: unit');
        return false;
      }

      return true;
    };

    if (!isValidProduct(data)) {
      console.error('Preskočen proizvod zbog nedostajućih obaveznih polja:', rawData);
      return false;
    }

    const productData = {
      user_id: userId,
      Naziv: data.name.trim(),
      Proizvođač: data.manufacturer.trim(),
      Cena: Number(data.price),
      "Jedinica mere": data.unit.trim(),
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
