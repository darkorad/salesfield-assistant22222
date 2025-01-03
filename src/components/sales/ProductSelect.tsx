import { Product, OrderItem, Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { CustomerInfoCard } from "./CustomerInfoCard";
import { OrderItemsList } from "./OrderItemsList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  return (
    <div className="space-y-4">
      <CustomerInfoCard customer={selectedCustomer} />

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-0.5">
          {products.map((product, index) => {
            const existingItem = orderItems.find(item => item.product.Naziv === product.Naziv);
            return (
              <div
                key={product.id}
                className={`p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{product.Naziv}</p>
                    <p className="text-sm text-gray-500">
                      {product.Proizvođač} - {product.Cena} RSD/{product["Jedinica mere"]}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
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
                    <span className="text-sm text-gray-600 w-16">
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
              newItems[index] = {
                ...newItems[index],
                paymentType
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