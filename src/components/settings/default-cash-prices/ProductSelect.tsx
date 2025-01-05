import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

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
          <SelectValue placeholder="Izaberite proizvod" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
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