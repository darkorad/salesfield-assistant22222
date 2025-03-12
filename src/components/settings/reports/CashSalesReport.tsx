
import { useState } from "react";
import { DateSelector } from "./components/DateSelector";
import { ExportButton } from "./components/ExportButton";
import { useCashSalesExport } from "./hooks/useCashSalesExport";
import { Button } from "@/components/ui/button";
import { Info, HelpCircle, Download } from "lucide-react";

export const CashSalesReport = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { isExporting, exportCashSales, hasExportFailed } = useCashSalesExport();
  const [showHelp, setShowHelp] = useState(false);

  const handleExportTodayCashSales = () => {
    exportCashSales(selectedDate);
  };

  const handleOpenInBrowser = () => {
    // This will open a download dialog directly in the browser
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = '#';
    a.download = `gotovinska-prodaja-${selectedDate ? new Date(selectedDate).toLocaleDateString('sr') : 'izvestaj'}.xlsx`;
    document.body.appendChild(a);
    a.dispatchEvent(event);
    document.body.removeChild(a);
    
    // Trigger the main export a moment later
    setTimeout(() => {
      exportCashSales(selectedDate);
    }, 100);
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
      
      {(hasExportFailed || showHelp) && (
        <div className="flex flex-col gap-2 mt-1">
          <Button 
            variant="outline" 
            className="w-full border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
            onClick={handleOpenInBrowser}
          >
            <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Otvori preuzimanje direktno
          </Button>
        </div>
      )}
      
      <div className="mt-3 text-xs text-muted-foreground">
        Nakon izvoza, fajl se čuva u Download/Preuzimanja folderu.
        Proverite i u "Moji fajlovi"/"Files" aplikaciji.
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-xs text-muted-foreground flex items-center mt-1 h-auto py-1"
        onClick={() => setShowHelp(!showHelp)}
      >
        <HelpCircle className="h-3 w-3 mr-1" />
        {showHelp ? "Sakrij pomoć" : "Prikaži pomoć oko preuzimanja"}
      </Button>
      
      {showHelp && (
        <div className="text-xs bg-muted/30 p-3 rounded-md space-y-2">
          <div className="flex gap-2">
            <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Na Android telefonu:</strong> Fajlovi se čuvaju u Download folderu.
              Otvorite "Files" ili "My Files" aplikaciju i potražite fajl u Download sekciji.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Na računaru:</strong> Fajlovi se preuzimaju u vaš Downloads/Preuzimanja folder
              koji možete naći u File Explorer-u/My Computer.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Alternativni metod:</strong> Ako ne možete da pronađete fajl, koristite
              "Otvori preuzimanje direktno" dugme koje će otvoriti fajl u browseru za direktno preuzimanje.
            </p>
          </div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground border-t pt-2 mt-1">
        <strong>Napomena:</strong> Ako imate problema sa pronalaženjem fajla, 
        pokušajte da koristite dugme "Otvori preuzimanje direktno" ili 
        proverite u Downloads/Preuzimanja folderu vašeg uređaja.
      </div>
    </div>
  );
};
