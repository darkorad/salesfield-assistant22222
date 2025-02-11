import { OrderItem } from "@/types";
import { OrderItemCard } from "./OrderItemCard";

interface OrderItemsListProps {
  items: OrderItem[];
  onQuantityChange: (index: number, quantity: number) => void;
  onPaymentTypeChange: (index: number, paymentType: 'cash' | 'invoice') => void;
  onRemoveItem: (index: number) => void;
}

export const OrderItemsList = ({ 
  items, 
  onQuantityChange, 
  onPaymentTypeChange,
  onRemoveItem 
}: OrderItemsListProps) => {
  return (
    <div className="space-y-2 mt-4">
      {items.map((item, index) => (
        <OrderItemCard
          key={`${item.product.Naziv}-${index}`}
          item={item}
          onQuantityChange={(quantity) => onQuantityChange(index, quantity)}
          onPaymentTypeChange={(paymentType) => onPaymentTypeChange(index, paymentType)}
          onRemove={() => onRemoveItem(index)}
        />
      ))}
    </div>
  );
};