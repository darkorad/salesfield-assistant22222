import { FileImport } from "@/components/settings/FileImport";
import { Reports } from "@/components/settings/Reports";

const Settings = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <FileImport />
        <Reports />
      </div>
    </div>
  );
};

export default Settings;