import { OrderItem } from "@/types/";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderItemCardProps {
  item: OrderItem;
  onQuantityChange: (quantity: number) => void;
  onPaymentTypeChange: (paymentType: 'cash' | 'invoice') => void;
  onRemove: () => void;
}

export const OrderItemCard = ({ 
  item, 
  onQuantityChange, 
  onPaymentTypeChange,
  onRemove 
}: OrderItemCardProps) => {
  const calculateItemTotal = (quantity: number) => {
    const unitSize = parseFloat(item.product["Jedinica mere"]) || 1;
    return item.product.Cena * quantity * unitSize;
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 p-3 border rounded-md bg-gray-50">
      <div className="flex-1">
        <p className="font-medium">{item.product.Naziv}</p>
        <p className="text-sm text-gray-500">
          {item.product.Proizvođač} - <span className="text-xs">{item.product.Cena} RSD/{item.product["Jedinica mere"]}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="1"
          max="100"
          value={item.quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
          className="w-16 text-sm"
        />
        <span className="whitespace-nowrap text-sm text-gray-600">
          {item.product["Jedinica mere"]}
        </span>
        <Select
          value={item.paymentType}
          onValueChange={(value: 'cash' | 'invoice') => onPaymentTypeChange(value)}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Način plaćanja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="invoice">Račun</SelectItem>
            <SelectItem value="cash">Gotovina</SelectItem>
          </SelectContent>
        </Select>
        <span className="w-24 text-right text-sm">
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