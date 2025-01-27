import { Product } from "@/types";
import { ProductSearchBar } from "./ProductSearchBar";
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
  return (
    <div className="relative">
      <ProductSearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      {searchTerm.trim() !== "" && (
        <ProductSearchResults
          products={filteredProducts}
          onSelect={handleAddProduct}
          getProductPrice={getProductPrice}
        />
      )}
    </div>
  );
};