import { ExportData } from "@/components/settings/ExportData";
import { CustomerGroupList } from "@/components/settings/customer-groups/CustomerGroupList";
import { CustomerPriceForm } from "@/components/settings/customer-prices/CustomerPriceForm";
import { GroupPriceForm } from "@/components/settings/group-prices/GroupPriceForm";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddCustomerDialog } from "@/components/settings/AddCustomerDialog";

const Settings = () => {
  const navigate = useNavigate();

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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Podešavanja</h2>
        <AddCustomerDialog />
      </div>

      <div>
        <CustomerPriceForm />
      </div>

      <div>
        <GroupPriceForm />
      </div>

      <div>
        <CustomerGroupList />
      </div>

      <div>
        <ExportData />
      </div>
    </div>
  );
};

export default Settings;