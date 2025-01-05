import { useState } from "react";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductSelect } from "./ProductSelect";
import { PriceInput } from "./PriceInput";
import { Button } from "@/components/ui/button";

interface PriceFormProps {
  products: Product[];
  onSave: () => void;
}

export const PriceForm = ({ products, onSave }: PriceFormProps) => {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [price, setPrice] = useState<number | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId || price === "") {
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
          price: price,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Proizvod
        </label>
        <ProductSelect
          products={products}
          value={selectedProductId}
          onChange={setSelectedProductId}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Cena za gotovinu
        </label>
        <PriceInput
          value={price}
          onChange={setPrice}
        />
      </div>

      <Button type="submit" className="w-full">
        Sačuvaj
      </Button>
    </form>
  );
};