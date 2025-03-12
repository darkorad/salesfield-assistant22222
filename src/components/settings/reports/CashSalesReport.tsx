
import { useState } from "react";
import { DateSelector } from "./components/DateSelector";
import { ExportButton } from "./components/ExportButton";
import { useCashSalesExport } from "./hooks/useCashSalesExport";

export const CashSalesReport = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { isExporting, exportCashSales, hasExportFailed } = useCashSalesExport();

  const handleExportTodayCashSales = () => {
    exportCashSales(selectedDate);
  };

  return (
    <div className="flex flex-col gap-3 mt-1">
      <div className="text-sm font-medium text-start">Izaberi datum</div>
      
      <DateSelector 
        selectedDate={selectedDate} 
        onDateChange={setSelectedDate} 
      />

      <ExportButton 
        onClick={handleExportTodayCashSales}
        isExporting={isExporting}
        showFallbackHelp={hasExportFailed}
      />
      
      <div className="mt-3 text-xs text-muted-foreground">
        Nakon izvoza, fajl se čuva u Download/Preuzimanja folderu.
        Proverite i u "Moji fajlovi"/"Files" aplikaciji.
      </div>
      
      <div className="text-xs text-muted-foreground border-t pt-2 mt-1">
        <strong>Napomena:</strong> Ako imate problema sa pronalaženjem fajla, 
        pokušajte da koristite dugme "Preuzmi direktno" koje će se pojaviti 
        ako standardno preuzimanje ne uspe.
      </div>
    </div>
  );
};
