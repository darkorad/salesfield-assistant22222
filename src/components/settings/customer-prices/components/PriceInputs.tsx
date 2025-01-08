import { Input } from "@/components/ui/input";

interface PriceInputsProps {
  invoicePrice: string;
  cashPrice: string;
  onInvoicePriceChange: (value: string) => void;
  onCashPriceChange: (value: string) => void;
}

export const PriceInputs = ({
  invoicePrice,
  cashPrice,
  onInvoicePriceChange,
  onCashPriceChange
}: PriceInputsProps) => {
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