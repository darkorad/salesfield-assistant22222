import { Product } from "@/types";
import { Input } from "@/components/ui/input";

interface PriceInputProps {
  selectedProduct?: Product;
  value: string;
  onChange: (value: string) => void;
}

export const PriceInput = ({ selectedProduct, value, onChange }: PriceInputProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        Cena za gotovinu {selectedProduct && `(Regularna: ${selectedProduct.Cena} RSD)`}
      </label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Unesite cenu za gotovinu"
        className="w-full"
      />
    </div>
  );
};