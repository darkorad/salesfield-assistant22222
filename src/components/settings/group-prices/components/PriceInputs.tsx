import { Input } from "@/components/ui/input";
import { Product } from "@/types";

interface PriceInputsProps {
  selectedProduct: Product | null;
  invoicePrice: string;
  cashPrice: string;
  onInvoicePriceChange: (value: string) => void;
  onCashPriceChange: (value: string) => void;
}

export const PriceInputs = ({
  selectedProduct,
  invoicePrice,
  cashPrice,
  onInvoicePriceChange,
  onCashPriceChange,
}: PriceInputsProps) => {
  if (!selectedProduct) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium">Cena za račun</label>
        <Input
          type="number"
          value={invoicePrice}
          onChange={(e) => onInvoicePriceChange(e.target.value)}
          placeholder="Unesite cenu za račun"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Cena za gotovinu</label>
        <Input
          type="number"
          value={cashPrice}
          onChange={(e) => onCashPriceChange(e.target.value)}
          placeholder="Unesite cenu za gotovinu"
        />
      </div>
    </div>
  );
};