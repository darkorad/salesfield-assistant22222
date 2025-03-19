
import { CustomerPriceForm } from "@/components/settings/customer-prices/CustomerPriceForm";
import { GroupPriceForm } from "@/components/settings/group-prices/GroupPriceForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reports } from "@/components/settings/Reports";
import MonthlySales from "./MonthlySales";
import { AddCustomerCard } from "@/components/settings/AddCustomerCard";
import { DuplicateCustomersChecker } from "@/components/settings/DuplicateCustomersChecker";
import { DataManagement } from "@/components/settings/data-management/DataManagement";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";

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

  const handleGoToDocuments = () => {
    navigate("/documents");
  };

  const handleGoToPlans = () => {
    navigate("/visit-plans");
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={handleGoToPlans}>Plan poseta</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Podešavanja</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleGoToPlans}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Nazad na plan poseta
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Podešavanja</TabsTrigger>
          <TabsTrigger value="reports">Izveštaji</TabsTrigger>
          <TabsTrigger value="documents" onClick={handleGoToDocuments}>Dokumenti</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">Podešavanja</h2>
            
            <div className="w-full">
              <DataManagement />
            </div>
            
            <div className="w-full">
              <AddCustomerCard />
            </div>
            
            <div className="w-full">
              <DuplicateCustomersChecker />
            </div>

            <div>
              <CustomerPriceForm />
            </div>

            <div>
              <GroupPriceForm />
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
