
import { Input } from "@/components/ui/input";
import { Product } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // This forces the numeric keyboard on mobile and fixes selection issues
  const inputMode = isMobile ? "decimal" : "numeric";
  
  if (!selectedProduct) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium">Cena za račun</label>
        <Input
          type="text"
          inputMode={inputMode}
          pattern="[0-9]*"
          value={invoicePrice}
          onChange={(e) => onInvoicePriceChange(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Unesite cenu za račun"
          className="w-full text-lg"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Cena za gotovinu</label>
        <Input
          type="text"
          inputMode={inputMode}
          pattern="[0-9]*"
          value={cashPrice}
          onChange={(e) => onCashPriceChange(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Unesite cenu za gotovinu"
          className="w-full text-lg"
        />
      </div>
    </div>
  );
};
