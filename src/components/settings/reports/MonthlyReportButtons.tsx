
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportMonthlyCustomerReport } from "@/utils/reports/monthlyCustomer";
import { exportMonthlyItemsReport } from "@/utils/reports/monthlyItems";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRedirectToDocuments } from "@/utils/fileExport";

export const MonthlyReportButtons = () => {
  const [isExportingCustomer, setIsExportingCustomer] = useState(false);
  const [isExportingItems, setIsExportingItems] = useState(false);
  const navigate = useNavigate();
  
  // Create the redirect function
  const redirectToDocuments = createRedirectToDocuments(navigate);

  const handleExportCustomer = async () => {
    if (isExportingCustomer) return;
    
    setIsExportingCustomer(true);
    try {
      await exportMonthlyCustomerReport(redirectToDocuments);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExportingCustomer(false);
    }
  };

  const handleExportItems = async () => {
    if (isExportingItems) return;
    
    setIsExportingItems(true);
    try {
      await exportMonthlyItemsReport(redirectToDocuments);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExportingItems(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full py-4 text-sm md:text-base font-medium border border-gray-200 hover:bg-accent/10 hover:text-accent hover:border-accent/20 transition-colors shadow-sm"
        onClick={handleExportCustomer}
        disabled={isExportingCustomer}
      >
        <FileSpreadsheet className="mr-2 h-4 w-4 md:h-5 md:w-5 text-accent" />
        {isExportingCustomer ? "Izvoz u toku..." : "Mesečna prodaja po kupcima"}
      </Button>
      
      <Button
        variant="outline"
        className="w-full py-4 text-sm md:text-base font-medium border border-gray-200 hover:bg-accent/10 hover:text-accent hover:border-accent/20 transition-colors shadow-sm"
        onClick={handleExportItems}
        disabled={isExportingItems}
      >
        <FileSpreadsheet className="mr-2 h-4 w-4 md:h-5 md:w-5 text-accent" />
        {isExportingItems ? "Izvoz u toku..." : "Mesečna prodaja po artiklima"}
      </Button>
    </>
  );
};
