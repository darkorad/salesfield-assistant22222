import { Input } from "@/components/ui/input";

interface ManufacturerSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const ManufacturerSearch = ({ value, onChange }: ManufacturerSearchProps) => {
  return (
    <Input
      type="text"
      placeholder="Pretraži proizvođače..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mb-4"
    />
  );
};