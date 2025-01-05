import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductSearchInput } from "@/components/sales/ProductSearchInput";
import { ProductSearchResults } from "@/components/sales/ProductSearchResults";
import { CustomerGroupSelect } from "./CustomerGroupSelect";
import { Product, Customer } from "@/types";
import { CustomerSearchInput } from "@/components/sales/CustomerSearchInput";
import { CustomerSearchResults } from "@/components/sales/CustomerSearchResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const GroupPriceForm = () => {
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [invoicePrice, setInvoicePrice] = useState("");
  const [cashPrice, setCashPrice] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Subscribe to group prices changes
    const groupPricesChannel = supabase
      .channel('group-prices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_prices'
        },
        (payload) => {
          console.log('Group price change detected:', payload);
          if (selectedGroup && selectedProduct) {
            fetchGroupPrices(selectedGroup.id, selectedProduct.id);
          }
        }
      )
      .subscribe();

    // Subscribe to customer prices changes
    const customerPricesChannel = supabase
      .channel('customer-prices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_prices'
        },
        (payload) => {
          console.log('Customer price change detected:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(groupPricesChannel);
      supabase.removeChannel(customerPricesChannel);
    };
  }, [selectedGroup, selectedProduct]);

  const fetchGroupPrices = async (groupId: string, productId: string) => {
    const { data, error } = await supabase
      .from('group_prices')
      .select('*')
      .eq('group_id', groupId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching group prices:', error);
      return;
    }

    if (data) {
      setInvoicePrice(data.invoice_price.toString());
      setCashPrice(data.cash_price.toString());
    }
  };

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
    const fetchCustomers = async () => {
      if (!selectedGroup) {
        setCustomers([]);
        return;
      }

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('group_name', selectedGroup.name)
        .order('name');

      if (error) {
        console.error('Error fetching customers:', error);
        toast.error("Greška pri učitavanju kupaca");
        return;
      }

      setCustomers(data || []);
    };

    fetchCustomers();
  }, [selectedGroup]);

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

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  const handleSubmit = async () => {
    if (!selectedProduct || (!selectedGroup && !selectedCustomer)) {
      toast.error("Molimo izaberite proizvod i grupu ili kupca");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niste prijavljeni");
      return;
    }

    if (selectedCustomer) {
      // Save individual customer price
      const { error } = await supabase
        .from('customer_prices')
        .upsert({
          customer_id: selectedCustomer.id,
          product_id: selectedProduct.id,
          invoice_price: parseFloat(invoicePrice),
          cash_price: parseFloat(cashPrice),
          user_id: session.user.id
        });

      if (error) {
        console.error('Error saving customer price:', error);
        toast.error("Greška pri čuvanju cene za kupca");
        return;
      }

      toast.success("Cena za kupca uspešno sačuvana");
    } else if (selectedGroup) {
      // Save group price
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
        console.error('Error saving group price:', error);
        toast.error("Greška pri čuvanju cene za grupu");
        return;
      }

      toast.success("Cena za grupu uspešno sačuvana");
    }

    setSelectedProduct(null);
    setSelectedCustomer(null);
    setProductSearch("");
    setCustomerSearch("");
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
          onGroupSelect={(group) => {
            setSelectedGroup(group);
            setSelectedCustomer(null);
            setCustomerSearch("");
          }}
        />

        {selectedGroup && (
          <div>
            <label className="text-sm font-medium">Kupac (opcionalno)</label>
            <div className="relative">
              <CustomerSearchInput
                value={customerSearch}
                onChange={setCustomerSearch}
              />
              {customerSearch && !selectedCustomer && (
                <CustomerSearchResults
                  customers={customers.filter(c => 
                    c.name.toLowerCase().includes(customerSearch.toLowerCase())
                  )}
                  onCustomerSelect={handleCustomerSelect}
                />
              )}
            </div>
          </div>
        )}

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
          disabled={!selectedProduct || (!selectedGroup && !selectedCustomer) || !invoicePrice || !cashPrice}
          className="w-full"
        >
          Sačuvaj cene
        </Button>
      </CardContent>
    </Card>
  );
};