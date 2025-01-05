import { Input } from "@/components/ui/input";

interface CustomerSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const CustomerSearchInput = ({ value, onChange }: CustomerSearchInputProps) => {
  return (
    <Input
      placeholder="Pretraži kupca..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  );
};