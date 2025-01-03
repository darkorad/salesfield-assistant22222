import { Product, OrderItem, Customer } from "@/types";
import { ProductSearchInput } from "./ProductSearchInput";
import { ProductSearchResults } from "./ProductSearchResults";
import { CustomerInfoCard } from "./CustomerInfoCard";
import { OrderItemsList } from "./OrderItemsList";
import { useProductSearch } from "./hooks/useProductSearch";

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
  const { productSearch, setProductSearch, filteredProducts } = useProductSearch(products);

  const handleAddProduct = (product: Product) => {
    const existingItemIndex = orderItems.findIndex(
      (item) => item.product.Naziv === product.Naziv
    );

    if (existingItemIndex !== -1) {
      const newItems = [...orderItems];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + 1,
      };
      onOrderItemsChange(newItems);
    } else {
      // Create a new order item with default payment type as 'invoice'
      const newItem: OrderItem = {
        product,
        quantity: 1,
        paymentType: 'invoice' as const
      };
      onOrderItemsChange([...orderItems, newItem]);
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

  const handlePaymentTypeChange = (index: number, paymentType: 'cash' | 'invoice') => {
    const newItems = [...orderItems];
    newItems[index] = {
      ...newItems[index],
      paymentType
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
        <CustomerInfoCard customer={selectedCustomer} />

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
          onPaymentTypeChange={handlePaymentTypeChange}
          onRemoveItem={handleRemoveItem}
        />
      </div>
    </div>
  );
};