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
import { Card, CardContent } from "@/components/ui/card";
import { PriceFormHeader } from "./PriceFormHeader";

interface PriceFormProps {
  customer: Customer;
  products: Product[];
  onSave: () => void;
}

export const PriceForm = ({ customer, products, onSave }: PriceFormProps) => {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [cashPrice, setCashPrice] = useState<string>("");
  const [invoicePrice, setInvoicePrice] = useState<string>("");

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    setCashPrice("");
    setInvoicePrice("");
  };

  const validateForm = () => {
    if (!selectedProductId) {
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
          product_id: selectedProductId,
          price: parseFloat(cashPrice),
          payment_type: 'cash',
          user_id: sessionData.session.user.id
        });
      }
      
      if (invoicePrice) {
        priceEntries.push({
          customer_id: customer.id,
          product_id: selectedProductId,
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
      setSelectedProductId("");
      setCashPrice("");
      setInvoicePrice("");
    } catch (error) {
      console.error('Error saving prices:', error);
      toast.error("Greška pri čuvanju cena");
    }
  };

  return (
    <Card>
      <PriceFormHeader title="Unos pojedinačnih cena" />
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Izaberite proizvod
          </label>
          <Select
            value={selectedProductId}
            onValueChange={handleProductSelect}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Izaberite proizvod" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <ScrollArea className="h-[200px]">
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
      </CardContent>
    </Card>
  );
};