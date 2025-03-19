
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createRedirectToDocuments } from "@/utils/fileExport";
import { exportDailyDetailedReport } from "@/utils/reports/daily-detailed/exportReport";

export const DailyReportButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      // Check user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }
      
      setUserEmail(session.user.email);
      
      // Create redirection function
      const redirectToDocuments = createRedirectToDocuments(navigate);
      
      // Generate the report
      await exportDailyDetailedReport(redirectToDocuments);
    } catch (error) {
      console.error("Error generating daily report:", error);
      toast.error("Greška pri generisanju dnevnog izveštaja");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-md border">
      <h3 className="text-lg font-medium">Dnevni izveštaj</h3>
      <p className="text-sm text-gray-500">
        Detaljan pregled dnevne prodaje sa svim artiklima, uključujući gotovinu i račune.
      </p>
      <Button 
        onClick={handleGenerateReport}
        disabled={isGenerating}
      >
        {isGenerating ? "Generisanje..." : "Generiši dnevni izveštaj"}
      </Button>
    </div>
  );
};
