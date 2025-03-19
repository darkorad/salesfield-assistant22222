
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export const FileLocationGuide = () => {
  return (
    <Alert className="mb-6">
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Lokacija izvezenih fajlova</AlertTitle>
      <AlertDescription>
        Svi izvezeni fajlovi će biti sačuvani u Downloads folder vašeg računara ili u Dokumenti folder
        na mobilnom uređaju. Kasnije ih možete pronaći i u listi dokumenata u aplikaciji.
      </AlertDescription>
    </Alert>
  );
};
