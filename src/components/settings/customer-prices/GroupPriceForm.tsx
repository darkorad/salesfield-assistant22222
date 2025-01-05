import { useState } from "react";
import { Product } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProductSelect } from "../default-cash-prices/ProductSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GroupPriceFormProps {
  groupName: string;
  products: Product[];
  onSave: () => void;
}

export const GroupPriceForm = ({ groupName, products, onSave }: GroupPriceFormProps) => {
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
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id')
        .eq('group_name', groupName);

      if (customersError) throw customersError;

      if (!customers || customers.length === 0) {
        toast.error("Nema kupaca u ovoj grupi");
        return;
      }

      const priceEntries = [];
      
      for (const customer of customers) {
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
      }

      const { error } = await supabase
        .from('customer_prices')
        .upsert(priceEntries, {
          onConflict: 'customer_id,product_id,payment_type'
        });

      if (error) throw error;

      toast.success("Cene su uspešno sačuvane za sve kupce u grupi");
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
      <CardHeader>
        <CardTitle className="text-lg">Unos grupnih cena</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProductSelect
          products={products}
          value={selectedProductId}
          onChange={handleProductSelect}
        />

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
              Sačuvaj cene za grupu
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};