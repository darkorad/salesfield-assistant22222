import { Product } from "@/types";
import { Input } from "@/components/ui/input";

interface PriceInputProps {
  selectedProduct: Product;
  value: string;
  onChange: (value: string) => void;
}

export const PriceInput = ({ selectedProduct, value, onChange }: PriceInputProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Cena (Redovna cena: {selectedProduct.Cena} RSD)
      </label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Unesite novu cenu"
        className="w-full"
      />
    </div>
  );
};