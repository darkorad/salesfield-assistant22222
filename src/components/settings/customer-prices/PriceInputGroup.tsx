import { Input } from "@/components/ui/input";

interface PriceInputGroupProps {
  label: string;
  regularPrice?: number;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const PriceInputGroup = ({
  label,
  regularPrice,
  value,
  onChange,
  placeholder,
}: PriceInputGroupProps) => (
  <div>
    <label className="block text-sm font-medium mb-1">
      {label} {regularPrice && `(Regularna: ${regularPrice} RSD)`}
    </label>
    <Input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full"
    />
  </div>
);