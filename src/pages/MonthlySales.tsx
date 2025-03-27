
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RefreshCw, AlertTriangle } from "lucide-react";

const MonthlySales = () => {
  const [monthlySales, setMonthlySales] = useState({
    totalCash: 0,
    totalInvoice: 0,
    total: 0
  });
  const [lastDataRefresh, setLastDataRefresh] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMonthlySales = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if there was a recent data import
      const userId = session.user.id;
      const lastImport = localStorage.getItem(`lastCustomersImport_${userId}`);
      setLastDataRefresh(lastImport);

      // If data was recently imported, don't show old sales data
      if (lastImport) {
        const lastImportDate = new Date(lastImport);
        const now = new Date();
        const differenceInHours = (now.getTime() - lastImportDate.getTime()) / (1000 * 60 * 60);
        
        // If the import was in the last 24 hours, just show zeros
        // This assumes that after import, new sales should start fresh
        if (differenceInHours < 24) {
          console.log("Recent import detected. Showing zero values for monthly sales.");
          setMonthlySales({
            totalCash: 0,
            totalInvoice: 0,
            total: 0
          });
          return;
        }
      }

      // Get first day of current month
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      firstDay.setHours(0, 0, 0, 0);

      // Get first day of next month
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      lastDay.setHours(0, 0, 0, 0);

      // Only get sales created after the last import (if any)
      let query = supabase
        .from('sales')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('created_at', firstDay.toISOString())
        .lt('created_at', lastDay.toISOString());

      if (lastImport) {
        // Only include sales created after the last import
        query = query.gte('created_at', new Date(lastImport).toISOString());
      }

      const { data: salesData, error } = await query;

      if (error) {
        console.error("Error loading sales:", error);
        return;
      }

      // If no sales data or empty array, set all values to 0
      if (!salesData || salesData.length === 0) {
        setMonthlySales({
          totalCash: 0,
          totalInvoice: 0,
          total: 0
        });
        return;
      }

      const cashSales = salesData.filter(sale => sale.payment_type === 'cash') || [];
      const invoiceSales = salesData.filter(sale => sale.payment_type === 'invoice') || [];

      setMonthlySales({
        totalCash: cashSales.reduce((sum, sale) => sum + (sale.total || 0), 0),
        totalInvoice: invoiceSales.reduce((sum, sale) => sum + (sale.total || 0), 0),
        total: salesData.reduce((sum, sale) => sum + (sale.total || 0), 0)
      });

    } catch (error) {
      console.error("Error:", error);
      setMonthlySales({
        totalCash: 0,
        totalInvoice: 0,
        total: 0
      });
    }
  };

  const handleClearData = async () => {
    try {
      setIsRefreshing(true);
      
      // Update the lastCustomersImport timestamp to force a reset
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const userId = session.user.id;
      const timestamp = new Date().toISOString();
      localStorage.setItem(`lastCustomersImport_${userId}`, timestamp);
      
      // Reset sales data in state
      setMonthlySales({
        totalCash: 0,
        totalInvoice: 0,
        total: 0
      });
      
      setLastDataRefresh(timestamp);
      toast.success("Podaci o prodaji su resetovani");
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("Greška pri resetovanju podataka");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMonthlySales();
    const interval = setInterval(fetchMonthlySales, 30000); // Refresh every 30 seconds
    
    // Setup listener for local storage changes related to customer imports
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('lastCustomersImport_')) {
        console.log('Customer import detected, refreshing data');
        fetchMonthlySales();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Card className="mt-4 md:mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg md:text-xl">Mesečna prodaja</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lastDataRefresh && (
            <div className="text-xs text-muted-foreground">
              Poslednji uvoz podataka: {new Date(lastDataRefresh).toLocaleString('sr-Latn-RS')}
            </div>
          )}
          <div className="pt-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Gotovina:</span>
              <span className="font-bold">{monthlySales.totalCash} RSD</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Račun:</span>
              <span className="font-bold">{monthlySales.totalInvoice} RSD</span>
            </div>
            <div className="flex justify-between items-center text-base pt-2 border-t">
              <span className="font-medium">Ukupno za mesec:</span>
              <span className="font-bold">{monthlySales.total} RSD</span>
            </div>
          </div>
          
          <div className="pt-8 mt-4 border-t border-gray-200">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full mt-2"
                  disabled={isRefreshing}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Resetuj podatke o prodaji
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Resetovanje podataka o prodaji</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ova akcija će resetovati sve podatke o prodaji u aplikaciji za tekući mesec. Podaci neće biti obrisani iz baze podataka, ali će biti skriveni u aplikaciji dok ne unesete nove prodaje.
                    <p className="font-semibold mt-2 text-destructive">
                      Ova akcija se ne može poništiti!
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Odustani</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Resetuj podatke
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlySales;
