
import { Input } from "@/components/ui/input";

interface CustomerSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const CustomerSearchInput = ({ value, onChange }: CustomerSearchInputProps) => {
  return (
    <Input
      type="text"
      placeholder="Pretraži kupce..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  );
};
