import { useState } from "react";
import { Customer, Product } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    if (product) {
      setSelectedProduct(product);
      setCashPrice("");
      setInvoicePrice("");
    }
  };

  const validateForm = () => {
    if (!selectedProduct) {
      toast.error("Izaberite proizvod");
      return false;
    }

    if (!cashPrice && !invoicePrice) {
      toast.error("Unesite bar jednu cenu");
      return false;
    }

    return true;
  };

  const handleSavePrices = async () => {
    if (!validateForm()) return;

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
    <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border">
      <div>
        <label className="block text-sm font-medium mb-1">
          Izaberite proizvod
        </label>
        <Select
          value={selectedProduct?.id}
          onValueChange={handleProductSelect}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Izaberite proizvod" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[300px]">
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex flex-col">
                    <span>{product.Naziv}</span>
                    <span className="text-sm text-gray-500">
                      {product.Proizvođač} - {product.Cena} RSD
                    </span>
                  </div>
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

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

          <div>
            <label className="block text-sm font-medium mb-1">
              Cena za račun (Regularna: {selectedProduct.Cena} RSD)
            </label>
            <Input
              type="number"
              value={invoicePrice}
              onChange={(e) => setInvoicePrice(e.target.value)}
              placeholder="Unesite cenu za račun"
              className="w-full"
            />
          </div>

          <Button onClick={handleSavePrices} className="w-full">
            Sačuvaj cene
          </Button>
        </div>
      )}
    </div>
  );
};