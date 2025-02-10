
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Customer, VisitPlan } from "@/types";
import { TodayVisits } from "@/components/visit-plans/TodayVisits";
import { VisitPlanTabs } from "@/components/visit-plans/VisitPlanTabs";

const VisitPlans = () => {
  const [visitPlans, setVisitPlans] = useState<VisitPlan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'EEEE').toLowerCase());
  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchData = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      const { data: plansData, error: plansError } = await supabase
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
        .eq("visit_day", today)
        .order("visit_time", { ascending: true });

      if (plansError) {
        console.error("Error fetching visit plans:", plansError);
        toast.error("Greška pri učitavanju planova poseta");
        return;
      }

      const { data: customersData, error: customersError } = await supabase
        .from("kupci_darko")
        .select("*")
        .order("name");

      if (customersError) {
        console.error("Error fetching customers:", customersError);
        toast.error("Greška pri učitavanju kupaca");
        return;
      }

      setVisitPlans(plansData || []);
      setCustomers(customersData || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Greška pri učitavanju podataka");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [today]);

  return (
    <div className="container mx-auto p-2">
      <div className="mb-4">
        <h1 className="text-lg font-bold mb-1">Plan poseta za {format(new Date(), 'dd.MM.yyyy.')}</h1>
        <p className="text-xs text-gray-600">Pregled današnjih poseta i rasporeda po danima</p>
      </div>

      <VisitPlanTabs 
        selectedDay={selectedDay}
        onDayChange={setSelectedDay}
        customers={customers}
      />

      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-2">Današnje posete</h2>
        <TodayVisits 
          isLoading={isLoading}
          visitPlans={visitPlans}
          date={format(new Date(), 'dd.MM.yyyy.')}
          customers={customers}
          onVisitAdded={fetchData}
        />
      </div>
    </div>
  );
};

export default VisitPlans;
