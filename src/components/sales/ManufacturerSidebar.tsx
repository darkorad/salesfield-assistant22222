import { useState, useEffect } from "react";
import { Product } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ManufacturerSearch } from "./manufacturer/ManufacturerSearch";
import { ManufacturerList } from "./manufacturer/ManufacturerList";
import { ProductList } from "./manufacturer/ProductList";
import { SidebarToggle } from "./manufacturer/SidebarToggle";

interface ManufacturerSidebarProps {
  products: Product[];
  onProductSelect?: (product: Product) => void;
}

export const ManufacturerSidebar = ({ products, onProductSelect }: ManufacturerSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [manufacturerSearch, setManufacturerSearch] = useState("");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Get unique manufacturers
  const manufacturers = Array.from(new Set(products.map(p => p.Proizvođač))).sort();
  
  // Filter manufacturers based on search
  const filteredManufacturers = manufacturers.filter(m => 
    m.toLowerCase().includes(manufacturerSearch.toLowerCase())
  );

  // Get products for selected manufacturer
  const manufacturerProducts = products.filter(p => p.Proizvođač === selectedManufacturer);

  // Handle touch gestures
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    const swipeThreshold = 50;

    if (touchStartX < 20 && deltaX > swipeThreshold) {
      setIsCollapsed(false);
    } else if (deltaX < -swipeThreshold) {
      setIsCollapsed(true);
    }

    setTouchStartX(null);
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStartX]);

  return (
    <div 
      className={`fixed top-0 left-0 h-full bg-secondary border-r shadow-lg transition-transform duration-300 transform ${
        isCollapsed ? '-translate-x-full' : 'translate-x-0'
      } z-30`}
      style={{ width: '280px' }}
    >
      <SidebarToggle onClick={() => setIsCollapsed(true)} />

      <ScrollArea className="h-screen p-4">
        <div className="space-y-4">
          <h2 className="font-semibold text-lg mb-4">Proizvođači</h2>
          
          <ManufacturerSearch 
            value={manufacturerSearch}
            onChange={setManufacturerSearch}
          />

          <ManufacturerList
            manufacturers={filteredManufacturers}
            selectedManufacturer={selectedManufacturer}
            onSelect={setSelectedManufacturer}
          />

          {selectedManufacturer && (
            <div className="mt-8">
              <h3 className="font-semibold mb-2">Proizvodi:</h3>
              <ProductList 
                products={manufacturerProducts}
                onSelect={onProductSelect || (() => {})}
              />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};