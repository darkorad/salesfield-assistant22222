
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

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
}: PriceInputGroupProps) => {
  const isMobile = useIsMobile();
  
  // This forces the numeric keyboard on mobile and fixes selection issues
  const inputMode = isMobile ? "decimal" : "numeric";
  
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {regularPrice && `(Regularna: ${regularPrice} RSD)`}
      </label>
      <Input
        type="text"
        inputMode={inputMode}
        pattern="[0-9]*"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
        placeholder={placeholder}
        className="w-full text-lg"
      />
    </div>
  );
};
