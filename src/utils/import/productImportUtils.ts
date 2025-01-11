import { supabase } from "@/integrations/supabase/client";

export interface ImportProduct {
  name: string;
  manufacturer?: string;
  price?: number;
  unit?: string;
}

export const processProductData = async (rawData: unknown, userId: string) => {
  try {
    // Type guard to validate the raw data
    const isValidProduct = (data: any): data is ImportProduct => {
      return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.name === 'string'
      );
    };

    if (!isValidProduct(rawData)) {
      console.error('Invalid product data format:', rawData);
      return false;
    }

    const productData = {
      user_id: userId,
      Naziv: rawData.name,
      Proizvođač: rawData.manufacturer || '',
      Cena: rawData.price || 0,
      "Jedinica mere": rawData.unit || '',
    };

    // Check for existing product to prevent duplicates
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('user_id', userId)
      .eq('Naziv', productData.Naziv)
      .eq('Proizvođač', productData.Proizvođač)
      .single();

    if (existingProduct) {
      // Update existing product
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', existingProduct.id);

      if (error) throw error;
    } else {
      // Insert new product
      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error processing product:', error);
    return false;
  }
};