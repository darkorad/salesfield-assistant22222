import { FileImport } from "@/components/settings/FileImport";
import { Reports } from "@/components/settings/Reports";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Settings = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex gap-4">
          <Button className="w-full sm:w-auto">
            <PlusCircle />
            Novi kupac
          </Button>
          <Button className="w-full sm:w-auto">
            <PlusCircle />
            Nova stavka cenovnika
          </Button>
        </div>
        <FileImport />
        <Reports />
      </div>
    </div>
  );
};

export default Settings;