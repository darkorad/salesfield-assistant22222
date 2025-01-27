import { Input } from "@/components/ui/input";

interface ProductSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ProductSearchBar = ({ 
  searchTerm, 
  onSearchChange 
}: ProductSearchBarProps) => {
  return (
    <Input
      type="text"
      placeholder="Pretraži proizvode..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="w-full"
      autoComplete="off"
    />
  );
};