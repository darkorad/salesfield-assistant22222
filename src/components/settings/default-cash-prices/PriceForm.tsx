import { useState } from "react";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProductSelect } from "./ProductSelect";
import { PriceInput } from "./PriceInput";

interface PriceFormProps {
  products: Product[];
  onSave: () => void;
}

export const PriceForm = ({ products, onSave }: PriceFormProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cashPrice, setCashPrice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setCashPrice("");
  };

  const validateForm = () => {
    if (!selectedProduct?.id) {
      toast.error("Izaberite proizvod");
      return false;
    }

    if (!cashPrice || isNaN(parseFloat(cashPrice))) {
      toast.error("Unesite validnu cenu");
      return false;
    }

    return true;
  };

  const handleSavePrice = async () => {
    if (!validateForm()) return;

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast.error("Niste prijavljeni");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('default_cash_prices')
        .upsert({
          product_id: selectedProduct.id,
          price: parseFloat(cashPrice),
          user_id: sessionData.session.user.id
        }, {
          onConflict: 'product_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast.success("Cena je uspešno sačuvana");
      onSave();
      setSelectedProduct(null);
      setCashPrice("");
    } catch (error: any) {
      console.error('Error saving price:', error);
      toast.error(error.message || "Greška pri čuvanju cene");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="font-medium text-lg mb-4">Unos podrazumevanih cena za gotovinu</h3>
      
      <ProductSelect
        products={products}
        selectedProduct={selectedProduct}
        onProductSelect={handleProductSelect}
      />

      {selectedProduct && (
        <div className="space-y-4">
          <PriceInput
            selectedProduct={selectedProduct}
            value={cashPrice}
            onChange={setCashPrice}
          />

          <Button 
            onClick={handleSavePrice} 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Čuvanje..." : "Sačuvaj cenu"}
          </Button>
        </div>
      )}
    </div>
  );
};