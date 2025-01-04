import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerPrices } from "@/components/settings/CustomerPrices";
import { DefaultCashPrices } from "@/components/settings/DefaultCashPrices";
import { ExportData } from "@/components/settings/ExportData";

const Settings = () => {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="customer-prices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customer-prices">Cene za kupce</TabsTrigger>
          <TabsTrigger value="default-cash-prices">Podrazumevane cene za gotovinu</TabsTrigger>
          <TabsTrigger value="export">Export podataka</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customer-prices">
          <CustomerPrices />
        </TabsContent>

        <TabsContent value="default-cash-prices">
          <DefaultCashPrices />
        </TabsContent>

        <TabsContent value="export">
          <ExportData />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;