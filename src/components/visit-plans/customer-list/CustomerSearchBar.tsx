
import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface CustomerSearchBarProps {
  searchTerm: string;
  onChange: (value: string) => void;
}

export const CustomerSearchBar = ({ searchTerm, onChange }: CustomerSearchBarProps) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Pretraži kupce..."
        value={searchTerm}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 text-sm w-full"
      />
      {searchTerm && (
        <button 
          onClick={() => onChange("")}
          className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
