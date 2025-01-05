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
        if (!pricesMap[price.product_id]) {
          pricesMap[price.product_id] = { cash: 0, invoice: 0 };
        }
        pricesMap[price.product_id][price.payment_type as 'cash' | 'invoice'] = price.price;
      });

      console.log('Updated customer prices:', pricesMap);
      setCustomerPrices(pricesMap);
    } catch (error) {
      console.error('Error in fetchCustomerPrices:', error);
    }
  };

  useEffect(() => {
    if (selectedCustomer?.id) {
      fetchCustomerPrices();

      // Subscribe to real-time changes in customer_prices
      const channel = supabase
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

      // Subscribe to real-time changes in products_darko
      const productsChannel = supabase
        .channel('products-darko-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products_darko'
          },
          (payload) => {
            console.log('Products changed:', payload);
            // Refresh customer prices as they might be affected by product price changes
            fetchCustomerPrices();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(productsChannel);
      };
    }
  }, [selectedCustomer]);

  const filteredProducts = products.filter((product) =>
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