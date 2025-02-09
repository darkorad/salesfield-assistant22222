
import { Product, Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { ProductSearchResults } from "../ProductSearchResults";

interface ProductSearchSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredProducts: Product[];
  handleAddProduct: (product: Product) => void;
  getProductPrice: (product: Product, paymentType: 'cash' | 'invoice') => number;
}

export const ProductSearchSection = ({
  searchTerm,
  setSearchTerm,
  filteredProducts,
  handleAddProduct,
  getProductPrice
}: ProductSearchSectionProps) => {
  // Create a wrapper function that uses 'cash' as default payment type
  const getDisplayPrice = (product: Product) => {
    return getProductPrice(product, 'cash');
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Pretraži proizvode..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
      {searchTerm && (
        <ProductSearchResults
          products={filteredProducts}
          onSelect={handleAddProduct}
          getProductPrice={getDisplayPrice}
        />
      )}
    </div>
  );
};
