
import { useState, useEffect } from "react";
import { Customer } from "@/types";
import { VisitPlansHeader } from "@/components/visit-plans/VisitPlansHeader";
import { VisitPlanTabs } from "@/components/visit-plans/VisitPlanTabs";
import { TodayVisitsSection } from "@/components/visit-plans/TodayVisitsSection";
import { useVisitPlansData } from "@/components/visit-plans/hooks/useVisitPlansData";
import { FileImport } from "@/components/settings/FileImport";
import { Button } from "@/components/ui/button";
import { UploadCloud, AlertCircle, WifiOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const getCurrentDayInSerbian = () => {
  const day = new Date().toLocaleString('sr-Latn-RS', { weekday: 'long' }).toLowerCase();
  const dayMap: { [key: string]: string } = {
    'ponedeljak': 'ponedeljak',
    'utorak': 'utorak',
    'sreda': 'sreda',
    'četvrtak': 'četvrtak',
    'petak': 'petak',
    'subota': 'subota',
    'nedelja': 'nedelja',
    'monday': 'ponedeljak',
    'tuesday': 'utorak',
    'wednesday': 'sreda',
    'thursday': 'četvrtak',
    'friday': 'petak',
    'saturday': 'subota',
    'sunday': 'nedelja'
  };
  return dayMap[day] || day;
};

const VisitPlans = () => {
  const { visitPlans, customers, isLoading, error, fetchData, lastDataRefresh, isOffline } = useVisitPlansData();
  const [selectedDay, setSelectedDay] = useState(getCurrentDayInSerbian());
  const [showImport, setShowImport] = useState(false);
  
  // Force data refresh when the component mounts
  useEffect(() => {
    console.log("VisitPlans component mounted, fetching fresh data");
    fetchData();
  }, [fetchData]);

  // Log customer day information for debugging
  useEffect(() => {
    if (customers.length > 0) {
      const dayFields = customers.slice(0, 10).map(c => ({
        name: c.name,
        dan_posete: c.dan_posete,
        dan_obilaska: c.dan_obilaska,
        visit_day: c.visit_day
      }));
      console.log("Sample customer day fields:", dayFields);
    }
  }, [customers]);

  const handleRefreshData = () => {
    toast.info("Osvežavanje podataka...");
    fetchData();
  };

  return (
    <div className="container mx-auto p-2">
      <VisitPlansHeader error={error} onRetry={fetchData} />
      
      {isOffline && (
        <div className="my-2 p-3 rounded-md bg-blue-50 border border-blue-200 flex items-center">
          <WifiOff className="mr-2 h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-700">
              Offline režim - koriste se lokalno sačuvani podaci
            </p>
          </div>
        </div>
      )}
      
      {!isOffline && !error && (
        <div className="flex justify-end mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshData}
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Osveži podatke
          </Button>
        </div>
      )}
      
      {error && (
        <div className={`mt-4 p-4 rounded-md ${error.includes("Nemate dozvolu") ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
          <div className="flex items-start">
            <AlertCircle className={`mr-2 h-5 w-5 ${error.includes("Nemate dozvolu") ? "text-red-500" : "text-amber-500"}`} />
            <div>
              <h3 className="text-lg font-medium mb-2">{error}</h3>
              
              {error.includes("Nema pronađenih kupaca") ? (
                <>
                  <p className="text-sm mb-4">
                    Da biste koristili planove poseta, potrebno je prvo uvesti listu kupaca.
                  </p>
                  {showImport ? (
                    <div className="space-y-4">
                      <FileImport />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowImport(false)}
                      >
                        Sakrij
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="default" 
                      onClick={() => setShowImport(true)}
                      className="gap-2"
                    >
                      <UploadCloud size={16} />
                      Uvezi listu kupaca
                    </Button>
                  )}
                </>
              ) : error.includes("Nemate dozvolu") ? (
                <p className="text-sm mb-2">
                  Nemate odgovarajuće dozvole za pristup podacima o kupcima. Molimo kontaktirajte administratora sistema.
                </p>
              ) : error.includes("Niste prijavljeni") ? (
                <p className="text-sm mb-2">
                  Potrebno je da se prijavite da biste videli ove podatke. Molimo prijavite se ponovo.
                </p>
              ) : (
                <p className="text-sm mb-2">
                  Došlo je do greške pri učitavanju podataka. Molimo pokušajte ponovo kasnije.
                </p>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchData}
                className="mt-2"
              >
                Pokušaj ponovo
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {!error && (
        <>
          <VisitPlanTabs 
            selectedDay={selectedDay}
            onDayChange={setSelectedDay}
            customers={customers}
            isOffline={isOffline}
          />

          <TodayVisitsSection 
            isLoading={isLoading}
            visitPlans={visitPlans}
            lastDataRefresh={lastDataRefresh}
            isOffline={isOffline}
            customers={customers}
          />
        </>
      )}
    </div>
  );
};

export default VisitPlans;
