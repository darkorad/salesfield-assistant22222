import { useState } from "react";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ManufacturerSidebarProps {
  products: Product[];
}

export const ManufacturerSidebar = ({ products }: ManufacturerSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);

  // Get unique manufacturers
  const manufacturers = Array.from(new Set(products.map(p => p.manufacturer))).sort();

  // Get products for selected manufacturer
  const manufacturerProducts = products.filter(p => p.manufacturer === selectedManufacturer);

  return (
    <>
      {/* Touch-sensitive area */}
      <div 
        className={`fixed top-0 left-0 w-4 h-full z-20 cursor-pointer ${isCollapsed ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
        onClick={() => setIsCollapsed(false)}
      />

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
                  onClick={() => setSelectedManufacturer(manufacturer)}
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
                      className="p-2 text-sm bg-background rounded-md"
                    >
                      <p className="font-medium">{product.name}</p>
                      <p className="text-muted-foreground">
                        {product.price} RSD/{product.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};