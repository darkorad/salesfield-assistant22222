import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VATStatusSelectProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const VATStatusSelect = ({ value, onChange }: VATStatusSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="vatStatus">Kupac u PDV-u</Label>
      <Select
        value={value ? "da" : "ne"}
        onValueChange={(value) => onChange(value === "da")}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Izaberi PDV status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="da">Da</SelectItem>
          <SelectItem value="ne">Ne</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};