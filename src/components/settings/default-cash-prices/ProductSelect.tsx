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
  const getDisplayValue = () => {
    if (!selectedProduct) return undefined;
    return `${selectedProduct.Naziv} - ${selectedProduct.Proizvođač}`;
  };

  return (
    <Select 
      value={selectedProduct?.id || ""} 
      onValueChange={onProductSelect}
    >
      <SelectTrigger className="w-full">
        <SelectValue 
          placeholder="Izaberite proizvod"
          defaultValue={getDisplayValue()}
        >
          {getDisplayValue()}
        </SelectValue>
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