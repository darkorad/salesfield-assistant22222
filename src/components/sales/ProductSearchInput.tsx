
import { Input } from "@/components/ui/input";

interface ProductSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProductSearchInput = ({ value, onChange }: ProductSearchInputProps) => {
  return (
    <Input
      type="text"
      placeholder="Pretraži proizvode..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  );
};
