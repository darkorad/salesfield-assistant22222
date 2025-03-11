
import { Product } from "@/types";
import { Input } from "@/components/ui/input";
import { ProductSearchResults } from "../ProductSearchResults";
import { Search, X } from "lucide-react";

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
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-accent" />
        <Input
          type="text"
          placeholder="Pretraži proizvode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 w-full text-sm ring-offset-accent focus-visible:ring-accent/30"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {searchTerm && (
        <ProductSearchResults
          products={filteredProducts}
          onSelect={handleAddProduct}
          getProductPrice={getProductPrice}
        />
      )}
    </div>
  );
};
