import { FileImport } from "@/components/settings/FileImport";
import { Reports } from "@/components/settings/Reports";
import { ContactSettings } from "@/components/settings/ContactSettings";
import { AddCustomerDialog } from "@/components/settings/AddCustomerDialog";

const Settings = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex gap-4">
          <AddCustomerDialog />
        </div>
        <ContactSettings />
        <FileImport />
        <Reports />
      </div>
    </div>
  );
};

export default Settings;