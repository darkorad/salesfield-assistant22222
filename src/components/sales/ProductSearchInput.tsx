import { Input } from "@/components/ui/input";

interface ProductSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProductSearchInput = ({ value, onChange }: ProductSearchInputProps) => {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pretraži proizvod..."
        className="w-full"
      />
    </div>
  );
};