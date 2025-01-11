import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImportProduct {
  name: string;
  manufacturer?: string;
  price?: number;
  unit?: string;
}

export const processProductData = async (product: ImportProduct, userId: string) => {
  try {
    const productData = {
      user_id: userId,
      Naziv: product.name,
      Proizvođač: product.manufacturer || '',
      Cena: product.price || 0,
      "Jedinica mere": product.unit || '',
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