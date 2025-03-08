
import { supabase } from "@/integrations/supabase/client";

export interface ImportProduct {
  name: string;          // Required (Naziv)
  manufacturer: string;  // Required (Proizvođač)
  price: number;         // Required (Cena)
  unit: string;          // Required (Jedinica mere)
}

export interface ImportGroupPrice {
  name: string;          // Product name to match
  manufacturer: string;  // Product manufacturer to match
  group: string;         // Required (Group name)
  invoice_price: number; // Required (Invoice price for group)
  cash_price: number;    // Required (Cash price for group)
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

export const processGroupPriceData = async (rawData: unknown, userId: string) => {
  try {
    // Map Excel column names to our field names
    const data = {
      ...rawData as any,
      name: (rawData as any).name || (rawData as any).Naziv,
      manufacturer: (rawData as any).manufacturer || (rawData as any).Proizvođač,
      group: (rawData as any).group,
      invoice_price: (rawData as any).invoice_price,
      cash_price: (rawData as any).cash_price
    };

    // Type guard to validate the data
    const isValidGroupPrice = (data: any): data is ImportGroupPrice => {
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

      if (!data.group || typeof data.group !== 'string' || !data.group.trim()) {
        console.error('Missing or invalid required field: group');
        return false;
      }

      if (data.invoice_price === undefined || isNaN(Number(data.invoice_price))) {
        console.error('Missing or invalid required field: invoice_price');
        return false;
      }

      if (data.cash_price === undefined || isNaN(Number(data.cash_price))) {
        console.error('Missing or invalid required field: cash_price');
        return false;
      }

      return true;
    };

    if (!isValidGroupPrice(data)) {
      console.error('Preskočena grupna cena zbog nedostajućih obaveznih polja:', rawData);
      return false;
    }

    // Find the product by name and manufacturer
    const { data: productData, error: productError } = await supabase
      .from('products_darko')
      .select('id')
      .eq('Naziv', data.name.trim())
      .eq('Proizvođač', data.manufacturer.trim())
      .maybeSingle();

    if (productError || !productData) {
      console.error('Product not found:', data.name, data.manufacturer, productError);
      return false;
    }

    // Find the group by name
    const { data: groupData, error: groupError } = await supabase
      .from('customer_groups')
      .select('id')
      .eq('name', data.group.trim())
      .maybeSingle();

    if (groupError) {
      console.error('Error finding group:', data.group, groupError);
      return false;
    }

    // If group doesn't exist, create it
    let groupId;
    if (!groupData) {
      const { data: newGroup, error: createError } = await supabase
        .from('customer_groups')
        .insert({
          name: data.group.trim(),
          user_id: userId
        })
        .select('id')
        .single();

      if (createError || !newGroup) {
        console.error('Error creating group:', data.group, createError);
        return false;
      }
      
      groupId = newGroup.id;
    } else {
      groupId = groupData.id;
    }

    // Insert price change for the group
    const { error: priceError } = await supabase
      .from('price_changes')
      .insert({
        group_id: groupId,
        product_id: productData.id,
        invoice_price: Number(data.invoice_price),
        cash_price: Number(data.cash_price),
        user_id: userId
      });

    if (priceError) {
      console.error('Error saving group price:', priceError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error processing group price:', error);
    return false;
  }
};
