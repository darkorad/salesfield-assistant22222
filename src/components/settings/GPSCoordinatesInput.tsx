import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

interface GPSCoordinatesInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const GPSCoordinatesInput = ({ value, onChange }: GPSCoordinatesInputProps) => {
  const handleGetGPSLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = `${position.coords.latitude},${position.coords.longitude}`;
          onChange(coordinates);
          toast.success("GPS koordinate su uspešno dodate");
        },
        (error) => {
          toast.error("Nije moguće dobiti GPS lokaciju");
          console.error("Error getting GPS location:", error);
        }
      );
    } else {
      toast.error("Vaš pretraživač ne podržava GPS lokaciju");
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="gpsCoordinates">GPS Koordinate</Label>
      <div className="flex gap-2">
        <Input
          id="gpsCoordinates"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Latitude,Longitude"
          readOnly
        />
        <Button 
          type="button" 
          variant="outline"
          onClick={handleGetGPSLocation}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Dodaj GPS
        </Button>
      </div>
    </div>
  );
};