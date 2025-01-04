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
  selectedProduct: Product | null;
  onProductSelect: (productId: string) => void;
}

export const ProductSelect = ({ products, selectedProduct, onProductSelect }: ProductSelectProps) => {
  return (
    <Select 
      value={selectedProduct?.id || ""} 
      onValueChange={onProductSelect}
    >
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