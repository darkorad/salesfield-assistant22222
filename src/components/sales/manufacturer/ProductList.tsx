import { Product } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductListProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export const ProductList = ({ products, onSelect }: ProductListProps) => {
  return (
    <div className="space-y-0.5">
      {products.map((product, index) => (
        <div
          key={product.id}
          className={`p-2 text-sm rounded-md flex flex-col gap-2 ${
            index % 2 === 0 ? 'bg-white' : 'bg-blue-50'
          }`}
        >
          <div>
            <p className="font-medium text-sm">{product.Naziv}</p>
            <p className="text-xs text-muted-foreground">
              {product.Cena} RSD/{product["Jedinica mere"]}
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              max="100"
              defaultValue="1"
              className="w-16"
            />
            <Select defaultValue="invoice">
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Način plaćanja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Račun</SelectItem>
                <SelectItem value="cash">Gotovina</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() => onSelect(product)}
            >
              Dodaj
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};