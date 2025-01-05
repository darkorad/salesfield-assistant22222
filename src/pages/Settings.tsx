import { CustomerPrices } from "@/components/settings/CustomerPrices";
import { DefaultCashPrices } from "@/components/settings/DefaultCashPrices";
import { ExportData } from "@/components/settings/ExportData";
import { CustomerGroupForm } from "@/components/settings/customer-groups/CustomerGroupForm";
import { CustomerGroupList } from "@/components/settings/customer-groups/CustomerGroupList";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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