import { ExportData } from "@/components/settings/ExportData";
import { CustomerPriceForm } from "@/components/settings/customer-prices/CustomerPriceForm";
import { GroupPriceForm } from "@/components/settings/group-prices/GroupPriceForm";
import { GroupSearch } from "@/components/settings/GroupSearch";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reports } from "@/components/settings/Reports";
import MonthlySales from "./MonthlySales";
import { AddCustomerCard } from "@/components/settings/AddCustomerCard";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("settings");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        navigate("/login");
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">Podešavanja</TabsTrigger>
          <TabsTrigger value="reports">Izveštaji</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Podešavanja</h2>
            
            <AddCustomerCard />

            <div>
              <CustomerPriceForm />
            </div>

            <div>
              <GroupPriceForm />
            </div>

            <div>
              <GroupSearch />
            </div>

            <div>
              <ExportData />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Izveštaji</h2>
            <Reports />
            <div>
              <h3 className="text-xl font-semibold mb-4">Mesečna prodaja u RSD</h3>
              <MonthlySales />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
