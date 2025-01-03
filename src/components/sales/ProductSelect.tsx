import { Product, OrderItem, Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { CustomerInfoCard } from "./CustomerInfoCard";
import { OrderItemsList } from "./OrderItemsList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const handleAddProduct = (product: Product, quantity: number, paymentType: 'cash' | 'invoice') => {
    const existingItemIndex = orderItems.findIndex(
      (item) => item.product.Naziv === product.Naziv
    );

    if (existingItemIndex !== -1) {
      const newItems = [...orderItems];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: quantity,
        paymentType: paymentType
      };
      onOrderItemsChange(newItems);
    } else {
      const newItem: OrderItem = {
        product,
        quantity,
        paymentType
      };
      onOrderItemsChange([...orderItems, newItem]);
    }
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
      <CustomerInfoCard customer={selectedCustomer} />

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {products.map((product) => {
            const existingItem = orderItems.find(item => item.product.Naziv === product.Naziv);
            return (
              <div
                key={product.id}
                className="p-4 border rounded-lg bg-white shadow-sm"
              >
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="font-medium">{product.Naziv}</p>
                    <p className="text-sm text-gray-500">
                      {product.Proizvođač} - {product.Cena} RSD/{product["Jedinica mere"]}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      min="1"
                      value={existingItem?.quantity || 1}
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value) || 1;
                        handleAddProduct(
                          product,
                          quantity,
                          existingItem?.paymentType || 'invoice'
                        );
                      }}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600">
                      {product["Jedinica mere"]}
                    </span>
                    <Select
                      value={existingItem?.paymentType || 'invoice'}
                      onValueChange={(value: 'cash' | 'invoice') => {
                        handleAddProduct(
                          product,
                          existingItem?.quantity || 1,
                          value
                        );
                      }}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Način plaćanja" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invoice">Račun</SelectItem>
                        <SelectItem value="cash">Gotovina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {orderItems.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Izabrani artikli:</h3>
          <OrderItemsList
            items={orderItems}
            onQuantityChange={handleQuantityChange}
            onPaymentTypeChange={handlePaymentTypeChange}
            onRemoveItem={handleRemoveItem}
          />
        </div>
      )}
    </div>
  );
};