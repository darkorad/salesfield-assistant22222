import { useState } from "react";
import { CustomerSelect } from "@/components/sales/CustomerSelect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Customer, Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductSearchInput } from "@/components/sales/ProductSearchInput";
import { ProductSearchResults } from "@/components/sales/ProductSearchResults";

export const CustomerPriceForm = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [invoicePrice, setInvoicePrice] = useState("");
  const [cashPrice, setCashPrice] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Fetch customers and products on component mount
  useState(() => {
    const fetchData = async () => {
      const { data: customersData } = await supabase.from("customers").select("*");
      const { data: productsData } = await supabase.from("products").select("*");
      
      if (customersData) setCustomers(customersData);
      if (productsData) setProducts(productsData);
    };
    
    fetchData();
  });

  // Filter products based on search
  useState(() => {
    const filtered = products.filter(product =>
      product.Naziv.toLowerCase().includes(productSearch.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [productSearch, products]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setProductSearch(product.Naziv);
    setInvoicePrice(product.Cena.toString());
    setCashPrice(product.Cena.toString());
  };

  const handleSubmit = async () => {
    if (!selectedCustomer || !selectedProduct) {
      toast.error("Molimo izaberite kupca i proizvod");
      return;
    }

    const { error } = await supabase
      .from("customer_prices")
      .upsert({
        customer_id: selectedCustomer.id,
        product_id: selectedProduct.id,
        invoice_price: parseFloat(invoicePrice),
        cash_price: parseFloat(cashPrice),
      });

    if (error) {
      console.error("Error saving price:", error);
      toast.error("Greška pri čuvanju cene");
      return;
    }

    toast.success("Cena uspešno sačuvana");
    
    // Reset form
    setSelectedProduct(null);
    setProductSearch("");
    setInvoicePrice("");
    setCashPrice("");
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Podešavanje cena za kupce</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Kupac</label>
          <CustomerSelect
            customers={customers}
            customerSearch={customerSearch}
            onCustomerSearchChange={setCustomerSearch}
            onCustomerSelect={handleCustomerSelect}
          />
        </div>

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
          disabled={!selectedCustomer || !selectedProduct || !invoicePrice || !cashPrice}
          className="w-full"
        >
          Sačuvaj cene
        </Button>
      </div>
    </div>
  );
};