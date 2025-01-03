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
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentType, setPaymentType] = useState<'invoice' | 'cash'>('invoice');

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

  return (
    <div className="mt-4 border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-semibold mb-4">Izbor artikala po proizvođaču</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <h4 className="font-medium mb-2">Proizvođači</h4>
          <ScrollArea className="h-[300px]">
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
          </ScrollArea>
        </div>

        {selectedManufacturer && (
          <div className="col-span-2">
            <h4 className="font-medium mb-2">Proizvodi:</h4>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {manufacturerProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 border rounded-md bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{product.Naziv}</p>
                        <p className="text-sm text-gray-600">
                          {product.Cena} RSD/{product["Jedinica mere"]}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                        <Select
                          value={paymentType}
                          onValueChange={(value: 'invoice' | 'cash') => setPaymentType(value)}
                        >
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
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};