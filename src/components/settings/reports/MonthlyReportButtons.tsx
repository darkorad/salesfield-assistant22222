
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createRedirectToDocuments } from "@/utils/fileExport";
import { exportMonthlyCustomerReport } from "@/utils/reports/monthlyCustomer";
import { exportMonthlyItemsReport } from "@/utils/reports/monthlyItems";
import { supabase } from "@/integrations/supabase/client";

export const MonthlyReportButtons = () => {
  const [isGeneratingCustomer, setIsGeneratingCustomer] = useState(false);
  const [isGeneratingItems, setIsGeneratingItems] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check user on component mount
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    
    checkUser();
  }, []);

  const handleGenerateCustomerReport = async () => {
    try {
      setIsGeneratingCustomer(true);
      
      // Create redirection function
      const redirectToDocuments = createRedirectToDocuments(navigate);
      
      // Generate the report using the appropriate function for each user
      await exportMonthlyCustomerReport(redirectToDocuments);
    } catch (error) {
      console.error("Error generating customer report:", error);
      toast.error("Greška pri generisanju izveštaja");
    } finally {
      setIsGeneratingCustomer(false);
    }
  };

  const handleGenerateItemsReport = async () => {
    try {
      setIsGeneratingItems(true);
      
      // Create redirection function
      const redirectToDocuments = createRedirectToDocuments(navigate);
      
      // Generate the report
      await exportMonthlyItemsReport(redirectToDocuments);
    } catch (error) {
      console.error("Error generating items report:", error);
      toast.error("Greška pri generisanju izveštaja");
    } finally {
      setIsGeneratingItems(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-md border">
      <h3 className="text-lg font-medium">Mesečni izveštaji</h3>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Izveštaj po kupcima</h4>
        <p className="text-sm text-gray-500 mb-2">
          Pregled kupovina svih kupaca za trenutni mesec.
        </p>
        <Button 
          onClick={handleGenerateCustomerReport}
          disabled={isGeneratingCustomer}
          variant="outline"
          className="w-full"
        >
          {isGeneratingCustomer ? "Generisanje..." : "Izveštaj po kupcima"}
        </Button>
      </div>
      
      <div className="mt-2">
        <h4 className="text-sm font-medium mb-2">Izveštaj po artiklima</h4>
        <p className="text-sm text-gray-500 mb-2">
          Pregled prodaje svih artikala za trenutni mesec.
        </p>
        <Button 
          onClick={handleGenerateItemsReport}
          disabled={isGeneratingItems}
          variant="outline"
          className="w-full"
        >
          {isGeneratingItems ? "Generisanje..." : "Izveštaj po artiklima"}
        </Button>
      </div>
    </div>
  );
};
