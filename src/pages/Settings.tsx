import { FileImport } from "@/components/settings/FileImport";
import { ContactSettings } from "@/components/settings/ContactSettings";
import { AddCustomerDialog } from "@/components/settings/AddCustomerDialog";
import { Reports } from "@/components/settings/Reports";
import { CommunicationButtons } from "@/components/settings/CommunicationButtons";
import { CustomerPrices } from "@/components/settings/CustomerPrices";

const Settings = () => {
  return (
    <div className="container mx-auto py-4 px-4 md:py-8 md:px-8 max-w-4xl">
      <div className="space-y-6">
        <div className="flex justify-center">
          <AddCustomerDialog />
        </div>
        <CustomerPrices />
        <ContactSettings />
        <CommunicationButtons />
        <FileImport />
        <Reports />
      </div>
    </div>
  );
};

export default Settings;