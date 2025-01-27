import { Product } from "@/types";
import { ProductSearchInput } from "@/components/sales/ProductSearchInput";
import { ProductSearchResults } from "@/components/sales/ProductSearchResults";

interface ProductSelectionProps {
  productSearch: string;
  selectedProduct: Product | null;
  filteredProducts: Product[];
  onProductSearchChange: (value: string) => void;
  onProductSelect: (product: Product) => void;
}

export const ProductSelection = ({
  productSearch,
  selectedProduct,
  filteredProducts,
  onProductSearchChange,
  onProductSelect,
}: ProductSelectionProps) => {
  return (
    <div>
      <label className="text-sm font-medium">Proizvod</label>
      <div className="relative">
        <ProductSearchInput
          value={productSearch}
          onChange={onProductSearchChange}
        />
        {productSearch && !selectedProduct && (
          <ProductSearchResults
            products={filteredProducts}
            onSelect={onProductSelect}
            getProductPrice={(product) => product.Cena}
          />
        )}
      </div>
    </div>
  );
};