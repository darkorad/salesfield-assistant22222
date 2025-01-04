import { Button } from "@/components/ui/button";

interface ManufacturerListProps {
  manufacturers: string[];
  selectedManufacturer: string | null;
  onSelect: (manufacturer: string) => void;
}

export const ManufacturerList = ({ 
  manufacturers, 
  selectedManufacturer, 
  onSelect 
}: ManufacturerListProps) => {
  return (
    <div className="space-y-1">
      {manufacturers.map((manufacturer) => (
        <Button
          key={manufacturer}
          variant={selectedManufacturer === manufacturer ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onSelect(manufacturer)}
        >
          {manufacturer}
        </Button>
      ))}
    </div>
  );
};