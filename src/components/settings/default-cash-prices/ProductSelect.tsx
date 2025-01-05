import { Product } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductSelectProps {
  products: Product[];
  value: string;
  onChange: (value: string) => void;
}

export const ProductSelect = ({ products, value, onChange }: ProductSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Izaberite proizvod" />
      </SelectTrigger>
      <SelectContent>
        {products.map((product) => (
          <SelectItem key={product.id} value={product.id}>
            {product.Naziv} - {product.Proizvođač}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};