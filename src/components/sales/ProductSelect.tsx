import { Product, OrderItem, Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { CustomerInfoCard } from "./CustomerInfoCard";
import { OrderItemsList } from "./OrderItemsList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { ProductSearchResults } from "./ProductSearchResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductSelectProps {
  products: Product[];
  orderItems: OrderItem[];
  selectedCustomer: Customer;
  onOrderItemsChange: (items: OrderItem[]) => void;
}

export const ProductSelect = ({
  products,
  orderItems,
  selectedCustomer,
  onOrderItemsChange,
}: ProductSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [customerPrices, setCustomerPrices] = useState<Record<string, { cash: number; invoice: number }>>({});
  const [localProducts, setLocalProducts] = useState(products);

  const fetchCustomerPrices = async () => {
    try {
      const { data: prices, error } = await supabase
        .from('customer_prices')
        .select('*')
        .eq('customer_id', selectedCustomer.id);

      if (error) {
        console.error('Error fetching customer prices:', error);
        return;
      }

      const pricesMap: Record<string, { cash: number; invoice: number }> = {};
      prices?.forEach(price => {
        pricesMap[price.product_id] = {
          cash: price.cash_price,
          invoice: price.invoice_price
        };
      });

      console.log('Updated customer prices:', pricesMap);
      setCustomerPrices(pricesMap);

      // Update existing order items with new prices
      const updatedOrderItems = orderItems.map(item => {
        const newPrice = getProductPrice(item.product, item.paymentType);
        return {
          ...item,
          product: {
            ...item.product,
            Cena: newPrice
          }
        };
      });
      onOrderItemsChange(updatedOrderItems);

    } catch (error) {
      console.error('Error in fetchCustomerPrices:', error);
      toast.error('Greška pri učitavanju cena');
    }
  };

  useEffect(() => {
    if (selectedCustomer?.id) {
      fetchCustomerPrices();

      // Subscribe to customer_prices changes
      const pricesChannel = supabase
        .channel('customer-prices-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'customer_prices',
            filter: `customer_id=eq.${selectedCustomer.id}`
          },
          (payload) => {
            console.log('Customer prices changed:', payload);
            fetchCustomerPrices();
          }
        )
        .subscribe();

      // Subscribe to products_darko changes
      const productsChannel = supabase
        .channel('products-darko-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products_darko'
          },
          async (payload) => {
            console.log('Products changed:', payload);
            // Refresh products and customer prices
            const { data: updatedProducts } = await supabase
              .from('products_darko')
              .select('*')
              .not('Naziv', 'eq', '');
            
            if (updatedProducts) {
              setLocalProducts(updatedProducts);
              // Update existing order items with new base prices
              const updatedOrderItems = orderItems.map(item => {
                const updatedProduct = updatedProducts.find(p => p.Naziv === item.product.Naziv);
                if (updatedProduct) {
                  const newPrice = getProductPrice(updatedProduct, item.paymentType);
                  return {
                    ...item,
                    product: {
                      ...updatedProduct,
                      Cena: newPrice
                    }
                  };
                }
                return item;
              });
              onOrderItemsChange(updatedOrderItems);
            }
            fetchCustomerPrices();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(pricesChannel);
        supabase.removeChannel(productsChannel);
      };
    }
  }, [selectedCustomer?.id]);

  const filteredProducts = localProducts.filter((product) =>
    product.Naziv.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductPrice = (product: Product, paymentType: 'cash' | 'invoice') => {
    const customPrice = customerPrices[product.id]?.[paymentType];
    return customPrice || product.Cena;
  };

  const handleAddProduct = (product: Product, quantity: number = 1, paymentType: 'cash' | 'invoice' = 'invoice') => {
    const price = getProductPrice(product, paymentType);
    const productWithPrice = { ...product, Cena: price };

    const existingItemIndex = orderItems.findIndex(
      (item) => item.product.Naziv === product.Naziv && item.paymentType === paymentType
    );

    if (existingItemIndex !== -1) {
      const newItems = [...orderItems];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: quantity,
        paymentType: paymentType,
        product: productWithPrice
      };
      onOrderItemsChange(newItems);
    } else {
      const newItem: OrderItem = {
        product: productWithPrice,
        quantity,
        paymentType
      };
      onOrderItemsChange([...orderItems, newItem]);
    }
    setSearchTerm("");
    setShowResults(false);
  };

  return (
    <div className="space-y-4">
      <CustomerInfoCard customer={selectedCustomer} />

      <div className="relative">
        <Input
          type="text"
          placeholder="Pretraži proizvode..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          className="w-full"
        />
        {showResults && searchTerm && (
          <ProductSearchResults
            products={filteredProducts}
            onSelect={(product) => handleAddProduct(product)}
            getProductPrice={getProductPrice}
          />
        )}
      </div>

      {orderItems.length > 0 && (
        <div className="mt-4">
          <OrderItemsList
            items={orderItems}
            onQuantityChange={(index, quantity) => {
              const newItems = [...orderItems];
              newItems[index] = {
                ...newItems[index],
                quantity: Math.max(1, quantity)
              };
              onOrderItemsChange(newItems);
            }}
            onPaymentTypeChange={(index, paymentType) => {
              const newItems = [...orderItems];
              const item = newItems[index];
              const newPrice = getProductPrice(item.product, paymentType);
              newItems[index] = {
                ...item,
                paymentType,
                product: { ...item.product, Cena: newPrice }
              };
              onOrderItemsChange(newItems);
            }}
            onRemoveItem={(index) => {
              const newItems = orderItems.filter((_, i) => i !== index);
              onOrderItemsChange(newItems);
            }}
          />
        </div>
      )}
    </div>
  );
};