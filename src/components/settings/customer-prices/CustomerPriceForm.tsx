import { useState, useEffect } from "react";
import { CustomerSelect } from "@/components/sales/CustomerSelect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Customer, Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { ProductSearchInput } from "@/components/sales/ProductSearchInput";
import { ProductSearchResults } from "@/components/sales/ProductSearchResults";
import { PriceInputs } from "./components/PriceInputs";
import { usePriceForm } from "./hooks/usePriceForm";

export const CustomerPriceForm = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  const {
    selectedCustomer,
    setSelectedCustomer,
    selectedProduct,
    setSelectedProduct,
    customerSearch,
    setCustomerSearch,
    productSearch,
    setProductSearch,
    invoicePrice,
    setInvoicePrice,
    cashPrice,
    setCashPrice,
    handleSubmit
  } = usePriceForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const [customersResponse, productsResponse] = await Promise.all([
          supabase.from("customers").select("*").eq('user_id', session.user.id),
          supabase.from('products').select("*").eq('user_id', session.user.id)
        ]);

        if (customersResponse.error) throw customersResponse.error;
        if (productsResponse.error) throw productsResponse.error;

        setCustomers(customersResponse.data || []);
        setProducts(productsResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
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

        {selectedCustomer && (
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
        )}

        {selectedProduct && (
          <PriceInputs
            invoicePrice={invoicePrice}
            cashPrice={cashPrice}
            onInvoicePriceChange={setInvoicePrice}
            onCashPriceChange={setCashPrice}
          />
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