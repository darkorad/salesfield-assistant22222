import { FileImport } from "@/components/settings/FileImport";
import { Reports } from "@/components/settings/Reports";
import { ContactSettings } from "@/components/settings/ContactSettings";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Settings = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex gap-4">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novi kupac
          </Button>
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova stavka cenovnika
          </Button>
        </div>
        <ContactSettings />
        <FileImport />
        <Reports />
      </div>
    </div>
  );
};

export default Settings;