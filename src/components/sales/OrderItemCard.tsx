import { OrderItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OrderItemCardProps {
  item: OrderItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export const OrderItemCard = ({ item, onQuantityChange, onRemove }: OrderItemCardProps) => {
  const calculateItemTotal = (quantity: number) => {
    const unitSize = parseFloat(item.product["Jedinica mere"]) || 1;
    return item.product.Cena * quantity * unitSize;
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 p-3 border rounded-md bg-gray-50">
      <div className="flex-1">
        <p className="font-medium">{item.product.Naziv}</p>
        <p className="text-sm text-gray-500">
          {item.product.Proizvođač} - {item.product.Cena} RSD/{item.product["Jedinica mere"]}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
          className="w-20"
        />
        <span className="whitespace-nowrap text-sm text-gray-600">
          {item.product["Jedinica mere"]}
        </span>
        <span className="w-24 text-right">
          {calculateItemTotal(item.quantity)} RSD
        </span>
        <Button
          variant="destructive"
          size="icon"
          onClick={onRemove}
        >
          ×
        </Button>
      </div>
    </div>
  );
};