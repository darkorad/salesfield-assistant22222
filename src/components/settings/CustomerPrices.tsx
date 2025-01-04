import { useState, useEffect } from "react";
import { Customer, Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerSelect } from "@/components/sales/CustomerSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const CustomerPrices = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cashPrice, setCashPrice] = useState<string>("");
  const [invoicePrice, setInvoicePrice] = useState<string>("");
  const [customerPrices, setCustomerPrices] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomersAndProducts();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerPrices();
    }
  }, [selectedCustomer]);

  const fetchCustomersAndProducts = async () => {
    try {
      const { data: customersData } = await supabase
        .from('customers')
        .select('*');
      
      const { data: productsData } = await supabase
        .from('products')
        .select('*');

      if (customersData) setCustomers(customersData);
      if (productsData) setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Greška pri učitavanju podataka");
    }
  };

  const fetchCustomerPrices = async () => {
    if (!selectedCustomer) return;

    try {
      const { data, error } = await supabase
        .from('customer_prices')
        .select('*')
        .eq('customer_id', selectedCustomer.id);

      if (error) throw error;
      setCustomerPrices(data || []);
    } catch (error) {
      console.error('Error fetching customer prices:', error);
      toast.error("Greška pri učitavanju cena");
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    
    // Find existing prices
    const existingPrices = customerPrices.filter(cp => cp.product_id === productId);
    const cashPriceEntry = existingPrices.find(p => p.payment_type === 'cash');
    const invoicePriceEntry = existingPrices.find(p => p.payment_type === 'invoice');
    
    setCashPrice(cashPriceEntry ? cashPriceEntry.price.toString() : "");
    setInvoicePrice(invoicePriceEntry ? invoicePriceEntry.price.toString() : "");
  };

  const handleSavePrices = async () => {
    if (!selectedCustomer || !selectedProduct) {
      toast.error("Izaberite kupca i proizvod");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast.error("Niste prijavljeni");
      return;
    }

    try {
      // Prepare price entries
      const priceEntries = [];
      if (cashPrice) {
        priceEntries.push({
          customer_id: selectedCustomer.id,
          product_id: selectedProduct.id,
          price: parseFloat(cashPrice),
          payment_type: 'cash',
          user_id: sessionData.session.user.id
        });
      }
      if (invoicePrice) {
        priceEntries.push({
          customer_id: selectedCustomer.id,
          product_id: selectedProduct.id,
          price: parseFloat(invoicePrice),
          payment_type: 'invoice',
          user_id: sessionData.session.user.id
        });
      }

      // Upsert prices
      const { error } = await supabase
        .from('customer_prices')
        .upsert(priceEntries, {
          onConflict: 'customer_id,product_id,payment_type'
        });

      if (error) throw error;

      toast.success("Cene su uspešno sačuvane");
      fetchCustomerPrices();
    } catch (error) {
      console.error('Error saving prices:', error);
      toast.error("Greška pri čuvanju cena");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Posebne cene za kupce</h2>
      
      <div className="space-y-4">
        <CustomerSelect
          customers={customers}
          customerSearch={customerSearch}
          onCustomerSearchChange={setCustomerSearch}
          onCustomerSelect={handleCustomerSelect}
        />

        {selectedCustomer && (
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
        )}
      </div>

      {selectedCustomer && customerPrices.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Postojeće posebne cene</h3>
          <div className="space-y-2">
            {customerPrices.reduce((acc: any[], price) => {
              const product = products.find(p => p.id === price.product_id);
              if (!product) return acc;
              
              const existingEntry = acc.find(e => e.product_id === price.product_id);
              if (existingEntry) {
                if (price.payment_type === 'cash') {
                  existingEntry.cashPrice = price.price;
                } else {
                  existingEntry.invoicePrice = price.price;
                }
              } else {
                acc.push({
                  product_id: price.product_id,
                  productName: `${product.Naziv} - ${product.Proizvođač}`,
                  cashPrice: price.payment_type === 'cash' ? price.price : null,
                  invoicePrice: price.payment_type === 'invoice' ? price.price : null,
                });
              }
              return acc;
            }, []).map((entry) => (
              <div key={entry.product_id} className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium">{entry.productName}</div>
                <div className="text-sm text-gray-600">
                  {entry.cashPrice && <div>Gotovina: {entry.cashPrice} RSD</div>}
                  {entry.invoicePrice && <div>Račun: {entry.invoicePrice} RSD</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};