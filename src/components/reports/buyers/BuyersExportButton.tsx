
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { exportBuyersList } from "@/utils/exports/buyersExport";

export const BuyersExportButton = () => {
  const [groupSearch, setGroupSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportBuyers = async () => {
    if (isExporting) return;
    
    try {
      setIsExporting(true);
      await exportBuyersList(groupSearch);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Pretraži grupe..."
        value={groupSearch}
        onChange={(e) => setGroupSearch(e.target.value)}
        className="mb-2"
      />
      <Button
        className="w-full py-4 text-base"
        onClick={handleExportBuyers}
        disabled={isExporting}
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        {isExporting ? "Izvoz u toku..." : "Izvezi listu kupaca"}
      </Button>
    </div>
  );
};
