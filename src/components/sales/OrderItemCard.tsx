import { OrderItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

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

  const handleIncrement = () => {
    onQuantityChange(item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.quantity - 1);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 p-3 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <p className="font-medium">{item.product.Naziv}</p>
        <p className="text-sm text-gray-500">
          {item.product.Proizvođač} - {item.product.Cena} RSD/{item.product["Jedinica mere"]}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
          className="w-20 text-center"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <span className="whitespace-nowrap text-sm text-gray-600">
          {item.product["Jedinica mere"]}
        </span>
        <span className="w-24 text-right font-medium">
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