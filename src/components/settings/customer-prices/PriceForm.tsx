import { useState } from "react";
import { Customer, Product } from "@/types";
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
  customer: Customer;
  products: Product[];
  onSave: () => void;
}

export const PriceForm = ({ customer, products, onSave }: PriceFormProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cashPrice, setCashPrice] = useState<string>("");
  const [invoicePrice, setInvoicePrice] = useState<string>("");

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setCashPrice("");
    setInvoicePrice("");
  };

  const handleSavePrices = async () => {
    if (!customer || !selectedProduct) {
      toast.error("Izaberite kupca i proizvod");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast.error("Niste prijavljeni");
      return;
    }

    try {
      const priceEntries = [];
      if (cashPrice) {
        priceEntries.push({
          customer_id: customer.id,
          product_id: selectedProduct.id,
          price: parseFloat(cashPrice),
          payment_type: 'cash',
          user_id: sessionData.session.user.id
        });
      }
      if (invoicePrice) {
        priceEntries.push({
          customer_id: customer.id,
          product_id: selectedProduct.id,
          price: parseFloat(invoicePrice),
          payment_type: 'invoice',
          user_id: sessionData.session.user.id
        });
      }

      const { error } = await supabase
        .from('customer_prices')
        .upsert(priceEntries, {
          onConflict: 'customer_id,product_id,payment_type'
        });

      if (error) throw error;

      toast.success("Cene su uspešno sačuvane");
      onSave();
      setSelectedProduct(null);
      setCashPrice("");
      setInvoicePrice("");
    } catch (error) {
      console.error('Error saving prices:', error);
      toast.error("Greška pri čuvanju cena");
    }
  };

  return (
    <div className="space-y-4">
      <Select onValueChange={handleProductSelect}>
        <SelectTrigger>
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Cena za račun (Regularna: {selectedProduct.Cena} RSD)
            </label>
            <Input
              type="number"
              value={invoicePrice}
              onChange={(e) => setInvoicePrice(e.target.value)}
              placeholder="Unesite cenu za račun"
            />
          </div>

          <Button onClick={handleSavePrices}>
            Sačuvaj cene
          </Button>
        </div>
      )}
    </div>
  );
};