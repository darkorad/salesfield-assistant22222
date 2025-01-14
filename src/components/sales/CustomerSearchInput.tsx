import { Input } from "@/components/ui/input";

interface CustomerSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const CustomerSearchInput = ({ value, onChange }: CustomerSearchInputProps) => {
  return (
    <div className="relative flex-1 min-w-0">
      <Input
        placeholder="Pretraži kupca po nazivu, grupi, gradu ili adresi..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    </div>
  );
};