import { CustomerPrices } from "@/components/settings/CustomerPrices";
import { DefaultCashPrices } from "@/components/settings/DefaultCashPrices";
import { ExportData } from "@/components/settings/ExportData";
import { CustomerGroupForm } from "@/components/settings/customer-groups/CustomerGroupForm";
import { CustomerGroupList } from "@/components/settings/customer-groups/CustomerGroupList";

const Settings = () => {
  return (
    <div className="space-y-8">
      <div>
        <CustomerPrices />
      </div>

      <div>
        <DefaultCashPrices />
      </div>

      <div>
        <div className="space-y-6">
          <CustomerGroupForm onGroupCreated={() => {}} />
          <CustomerGroupList />
        </div>
      </div>

      <div>
        <ExportData />
      </div>
    </div>
  );
};

export default Settings;