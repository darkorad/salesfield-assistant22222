import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Customer } from "@/types";
import { TodayVisits } from "@/components/visit-plans/TodayVisits";
import { VisitPlanTabs } from "@/components/visit-plans/VisitPlanTabs";

interface VisitPlan {
  id: string;
  customer_id: string;
  visit_day: string;
  visit_time: string | null;
  notes: string | null;
  customer: {
    name: string;
    address: string;
    city: string;
  };
}

const VisitPlans = () => {
  const [visitPlans, setVisitPlans] = useState<VisitPlan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'EEEE').toLowerCase());
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
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
          .eq("dan_obilaska", today)
          .order("visit_time", { ascending: true });

        if (plansError) {
          console.error("Error fetching visit plans:", plansError);
          toast.error("Greška pri učitavanju planova poseta");
          return;
        }

        const { data: customersData, error: customersError } = await supabase
          .from("kupci_darko")
          .select("id, name, address, city, dan_obilaska")
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

    fetchData();
  }, [today]);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Plan poseta za {format(new Date(), 'dd.MM.yyyy.')}</h1>
        <p className="text-gray-600">Pregled današnjih poseta i rasporeda po danima</p>
      </div>

      <VisitPlanTabs 
        selectedDay={selectedDay}
        onDayChange={setSelectedDay}
        customers={customers}
      />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Današnje posete</h2>
        <TodayVisits 
          isLoading={isLoading}
          visitPlans={visitPlans}
          date={format(new Date(), 'dd.MM.yyyy.')}
        />
      </div>
    </div>
  );
};

export default VisitPlans;