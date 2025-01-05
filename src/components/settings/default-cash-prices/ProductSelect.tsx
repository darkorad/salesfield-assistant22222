import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types";

interface ProductSelectProps {
  products: Product[];
  selectedProduct: Product | null;
  onProductSelect: (productId: string) => void;
}

export const ProductSelect = ({ 
  products, 
  selectedProduct, 
  onProductSelect 
}: ProductSelectProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        Izaberite proizvod
      </label>
      <Select 
        value={selectedProduct?.id} 
        onValueChange={onProductSelect}
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Izaberite proizvod">
            {selectedProduct && `${selectedProduct.Naziv} - ${selectedProduct.Proizvođač} (${selectedProduct.Cena} RSD)`}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white max-h-[300px]">
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id}>
              {product.Naziv} - {product.Proizvođač} ({product.Cena} RSD)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};