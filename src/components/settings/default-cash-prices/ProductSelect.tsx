import { Product } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ProductSelectProps {
  products: Product[];
  value: string;
  onChange: (value: string) => void;
}

export const ProductSelect = ({ products, value, onChange }: ProductSelectProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Proizvod</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Izaberite proizvod" />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-[300px]">
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                <div className="flex flex-col">
                  <span>{product.Naziv}</span>
                  <span className="text-sm text-gray-500">
                    {product.Proizvođač} - {product.Cena} RSD
                  </span>
                </div>
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};