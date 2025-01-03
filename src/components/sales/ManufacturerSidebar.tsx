import { useState, useEffect } from "react";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ManufacturerSidebarProps {
  products: Product[];
  onProductSelect?: (product: Product) => void;
}

export const ManufacturerSidebar = ({ products, onProductSelect }: ManufacturerSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Get unique manufacturers
  const manufacturers = Array.from(new Set(products.map(p => p.Proizvođač))).sort();

  // Get products for selected manufacturer
  const manufacturerProducts = products.filter(p => p.Proizvođač === selectedManufacturer);

  const handleManufacturerClick = (manufacturer: string) => {
    setSelectedManufacturer(manufacturer);
  };

  const handleProductSelect = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  // Handle touch start
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  // Handle touch end
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
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-4 z-10"
        onClick={() => setIsCollapsed(true)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <ScrollArea className="h-screen p-4">
        <div className="space-y-4">
          <h2 className="font-semibold text-lg mb-4">Proizvođači</h2>
          <div className="space-y-1">
            {manufacturers.map((manufacturer) => (
              <Button
                key={manufacturer}
                variant={selectedManufacturer === manufacturer ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleManufacturerClick(manufacturer)}
              >
                {manufacturer}
              </Button>
            ))}
          </div>

          {selectedManufacturer && (
            <div className="mt-8">
              <h3 className="font-semibold mb-2">Proizvodi:</h3>
              <div className="space-y-2">
                {manufacturerProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-2 text-sm bg-background rounded-md flex flex-col gap-2"
                  >
                    <div>
                      <p className="font-medium">{product.Naziv}</p>
                      <p className="text-muted-foreground">
                        {product.Cena} RSD/{product["Jedinica mere"]}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        defaultValue="1"
                        className="w-20"
                      />
                      <Select defaultValue="invoice">
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Način plaćanja" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invoice">Račun</SelectItem>
                          <SelectItem value="cash">Gotovina</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => handleProductSelect(product)}
                      >
                        Dodaj
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};