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
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Izaberite proizvod">
            {selectedProduct ? `${selectedProduct.Naziv} - ${selectedProduct.Cena} RSD` : "Izaberite proizvod"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id}>
              {product.Naziv} - {product.Cena} RSD
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};