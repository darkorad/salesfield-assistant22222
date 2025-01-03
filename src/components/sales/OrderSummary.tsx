import { OrderItem } from "@/types";

interface OrderSummaryProps {
  orderItems: OrderItem[];
}

export const OrderSummary = ({ orderItems }: OrderSummaryProps) => {
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const unitSize = parseFloat(item.product["Jedinica mere"]) || 1;
      return sum + (item.product.Cena * item.quantity * unitSize);
    }, 0);
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Pregled porudžbine</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Broj artikala:</span>
          <span>{orderItems.length}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Ukupno:</span>
          <span>{calculateTotal().toFixed(2)} RSD</span>
        </div>
      </div>
    </div>
  );
};