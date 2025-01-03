import { useState } from "react";
import { Product, OrderItem, Customer } from "@/types";
import { ProductSearchInput } from "./ProductSearchInput";
import { ProductSearchResults } from "./ProductSearchResults";
import { CustomerInfoCard } from "./CustomerInfoCard";
import { OrderItemsList } from "./OrderItemsList";
import { RecentOrders } from "./RecentOrders";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = products.filter((product) => {
    const searchTerm = productSearch.toLowerCase();
    const productName = product.Naziv?.toLowerCase() || "";
    const matchesSearch = productName.includes(searchTerm);
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = (product: Product) => {
    const existingItemIndex = orderItems.findIndex(
      (item) => item.product.Naziv === product.Naziv
    );

    if (existingItemIndex !== -1) {
      const newItems = [...orderItems];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + 1
      };
      onOrderItemsChange(newItems);
    } else {
      const newItems = [...orderItems, { product, quantity: 1 }];
      onOrderItemsChange(newItems);
    }
    setProductSearch("");
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const newItems = [...orderItems];
    newItems[index] = {
      ...newItems[index],
      quantity: Math.max(1, newQuantity)
    };
    onOrderItemsChange(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    onOrderItemsChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold mb-4">Proizvodi</h2>
        
        <CustomerInfoCard customer={selectedCustomer} />
        
        <RecentOrders onItemSelect={onOrderItemsChange} />

        <div className="flex gap-2 mb-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sve kategorije" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sve kategorije</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label className="text-sm font-medium">Izbor artikala</label>
        <div className="relative">
          <ProductSearchInput 
            value={productSearch}
            onChange={setProductSearch}
          />
          {productSearch && (
            <ProductSearchResults
              products={filteredProducts}
              onSelect={handleAddProduct}
            />
          )}
        </div>

        <OrderItemsList
          items={orderItems}
          onQuantityChange={handleQuantityChange}
          onRemoveItem={handleRemoveItem}
        />
      </div>
    </div>
  );
};