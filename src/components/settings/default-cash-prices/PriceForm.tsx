import { useState } from "react";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductSelect } from "./ProductSelect";
import { PriceInput } from "./PriceInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PriceFormHeader } from "../customer-prices/PriceFormHeader";

interface PriceFormProps {
  products: Product[];
  onSave: () => void;
}

export const PriceForm = ({ products, onSave }: PriceFormProps) => {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [price, setPrice] = useState("");

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId || !price) {
      toast.error("Molimo popunite sva polja");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const { error } = await supabase
        .from('default_cash_prices')
        .upsert({
          product_id: selectedProductId,
          price: parseFloat(price),
          user_id: session.user.id
        }, {
          onConflict: 'product_id,user_id'
        });

      if (error) throw error;

      toast.success("Cena je uspešno sačuvana");
      setSelectedProductId("");
      setPrice("");
      onSave();
    } catch (error) {
      console.error('Error saving price:', error);
      toast.error("Greška pri čuvanju cene");
    }
  };

  return (
    <Card>
      <PriceFormHeader title="Nova podrazumevana cena" />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProductSelect
            products={products}
            value={selectedProductId}
            onChange={setSelectedProductId}
          />

          <PriceInput
            selectedProduct={selectedProduct}
            value={price}
            onChange={setPrice}
          />

          <Button type="submit" className="w-full">
            Sačuvaj
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};