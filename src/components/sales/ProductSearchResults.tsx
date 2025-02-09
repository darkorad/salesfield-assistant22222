
import { Product } from "@/types";

interface ProductSearchResultsProps {
  products: Product[];
  onSelect: (product: Product) => void;
  getProductPrice: (product: Product) => number;
}

export const ProductSearchResults = ({ products, onSelect, getProductPrice }: ProductSearchResultsProps) => {
  if (products.length === 0) {
    return (
      <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 p-2">
        <p className="text-sm text-gray-500">Nema rezultata</p>
      </div>
    );
  }

  return (
    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
      {products.map((product) => (
        <button
          key={product.id}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
          onClick={() => onSelect(product)}
        >
          <div className="text-sm font-medium">{product.Naziv}</div>
          <div className="text-xs text-gray-500">
            <span className="mr-2">{product.Proizvođač}</span>
            <span className="mr-2">Gotovina: {product.Cena} RSD</span>
            <span>Račun: {product.Cena} RSD</span>
          </div>
        </button>
      ))}
    </div>
  );
};
