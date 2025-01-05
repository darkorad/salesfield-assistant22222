import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductSearchInput } from "@/components/sales/ProductSearchInput";
import { ProductSearchResults } from "@/components/sales/ProductSearchResults";
import { CustomerGroupSelect } from "./CustomerGroupSelect";
import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const GroupPriceForm = () => {
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [invoicePrice, setInvoicePrice] = useState("");
  const [cashPrice, setCashPrice] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: productsData, error } = await supabase
        .from('products_darko')
        .select('*')
        .not('Naziv', 'eq', '');

      if (error) {
        console.error('Error fetching products:', error);
        toast.error("Greška pri učitavanju proizvoda");
        return;
      }

      setProducts(productsData || []);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.Naziv.toLowerCase().includes(productSearch.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [productSearch, products]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setProductSearch(product.Naziv);
    setInvoicePrice(product.Cena.toString());
    setCashPrice(product.Cena.toString());
  };

  const handleSubmit = async () => {
    if (!selectedGroup || !selectedProduct) {
      toast.error("Molimo izaberite grupu i proizvod");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    const { error } = await supabase
      .from('group_prices')
      .upsert({
        group_id: selectedGroup.id,
        product_id: selectedProduct.id,
        invoice_price: parseFloat(invoicePrice),
        cash_price: parseFloat(cashPrice),
        user_id: session.user.id
      });

    if (error) {
      console.error('Error saving price:', error);
      toast.error("Greška pri čuvanju cene");
      return;
    }

    toast.success("Cena uspešno sačuvana");
    setSelectedProduct(null);
    setProductSearch("");
    setInvoicePrice("");
    setCashPrice("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Podešavanje cena za grupe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CustomerGroupSelect
          selectedGroup={selectedGroup}
          onGroupSelect={setSelectedGroup}
        />

        <div>
          <label className="text-sm font-medium">Proizvod</label>
          <div className="relative">
            <ProductSearchInput
              value={productSearch}
              onChange={setProductSearch}
            />
            {productSearch && !selectedProduct && (
              <ProductSearchResults
                products={filteredProducts}
                onSelect={handleProductSelect}
                getProductPrice={(product) => product.Cena}
              />
            )}
          </div>
        </div>

        {selectedProduct && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Cena za račun</label>
              <Input
                type="number"
                value={invoicePrice}
                onChange={(e) => setInvoicePrice(e.target.value)}
                placeholder="Unesite cenu za račun"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cena za gotovinu</label>
              <Input
                type="number"
                value={cashPrice}
                onChange={(e) => setCashPrice(e.target.value)}
                placeholder="Unesite cenu za gotovinu"
              />
            </div>
          </div>
        )}

        <Button 
          onClick={handleSubmit}
          disabled={!selectedGroup || !selectedProduct || !invoicePrice || !cashPrice}
          className="w-full"
        >
          Sačuvaj cene
        </Button>
      </CardContent>
    </Card>
  );
};