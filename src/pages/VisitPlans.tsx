import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

interface VisitPlan {
  id: string;
  customer_id: string;
  visit_day: string;
  visit_time: string | null;
  notes: string | null;
  dan_obilaska: string | null;
  customer: {
    name: string;
    address: string;
    city: string;
  };
}

const VisitPlans = () => {
  const [visitPlans, setVisitPlans] = useState<VisitPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchVisitPlans = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Niste prijavljeni");
          return;
        }

        const { data, error } = await supabase
          .from("visit_plans")
          .select(`
            *,
            customer:kupci_darko!visit_plans_customer_id_fkey (
              name,
              address,
              city
            )
          `)
          .eq("user_id", session.session?.user.id)
          .eq("dan_obilaska", today)
          .order("visit_time", { ascending: true });

        if (error) {
          console.error("Error fetching visit plans:", error);
          toast.error("Greška pri učitavanju planova poseta");
          return;
        }

        setVisitPlans(data || []);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Greška pri učitavanju planova poseta");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitPlans();
  }, [today]);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Plan poseta za {format(new Date(), 'dd.MM.yyyy.')}</h1>
        <p className="text-gray-600">Pregled današnjih poseta</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kupac</TableHead>
                  <TableHead>Adresa</TableHead>
                  <TableHead>Vreme</TableHead>
                  <TableHead>Napomene</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitPlans.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>{visit.customer?.name}</TableCell>
                    <TableCell>
                      {visit.customer?.address}, {visit.customer?.city}
                    </TableCell>
                    <TableCell>{visit.visit_time}</TableCell>
                    <TableCell>{visit.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj posetu
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dodaj novu posetu za {format(new Date(), 'dd.MM.yyyy.')}</DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                    <p className="text-gray-500">Forma za dodavanje posete će biti implementirana uskoro.</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VisitPlans;