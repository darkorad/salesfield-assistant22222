import { useState } from "react";
import { Product } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const handleSavePrice = async () => {
    if (!selectedProduct?.id) {
      toast.error("Izaberite proizvod");
      return;
    }

    if (!cashPrice || isNaN(parseFloat(cashPrice))) {
      toast.error("Unesite validnu cenu");
      return;
    }

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
      
      <Select 
        value={selectedProduct?.id || ""} 
        onValueChange={handleProductSelect}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Izaberite proizvod" />
        </SelectTrigger>
        <SelectContent>
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id}>
              {product.Naziv} - {product.Proizvođač}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedProduct && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Cena za gotovinu (Regularna: {selectedProduct.Cena} RSD)
            </label>
            <Input
              type="number"
              value={cashPrice}
              onChange={(e) => setCashPrice(e.target.value)}
              placeholder="Unesite cenu za gotovinu"
              className="w-full"
            />
          </div>

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