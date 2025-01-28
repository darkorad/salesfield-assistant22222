import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { LoadingState } from "@/components/visit-plans/LoadingState";
import { VisitPlansTable } from "@/components/visit-plans/VisitPlansTable";
import { AddVisitDialog } from "@/components/visit-plans/AddVisitDialog";

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
  const today = format(new Date(), "yyyy-MM-dd");

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
        <h1 className="text-2xl font-bold mb-2">
          Plan poseta za {format(new Date(), "dd.MM.yyyy.")}
        </h1>
        <p className="text-gray-600">Pregled današnjih poseta</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            <VisitPlansTable visitPlans={visitPlans} />
            <div className="mt-4">
              <AddVisitDialog
                isOpen={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VisitPlans;