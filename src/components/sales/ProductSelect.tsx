
import { useState } from "react";
import { Product } from "@/types";
import { ProductSearchInput } from "./ProductSearchInput";
import { ProductSearchResults } from "./ProductSearchResults";

interface ProductSelectProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  defaultValue?: string;
}

export const ProductSelect = ({ products, onProductSelect, defaultValue = "" }: ProductSelectProps) => {
  const [search, setSearch] = useState(defaultValue);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const filtered = products.filter(product =>
      product.Naziv.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  return (
    <div className="relative">
      <ProductSearchInput
        value={search}
        onChange={handleSearchChange}
      />
      {search && filteredProducts.length > 0 && (
        <ProductSearchResults
          products={filteredProducts}
          onSelect={(product) => {
            onProductSelect(product);
            setSearch(product.Naziv);
            setFilteredProducts([]);
          }}
          getProductPrice={(product) => product.Cena}
        />
      )}
    </div>
  );
};
