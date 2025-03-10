
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
  completed: boolean;
  customer: {
    name: string;
    address: string;
    city: string;
  };
}

const getCurrentDayInSerbian = () => {
  const day = format(new Date(), 'EEEE').toLowerCase();
  const dayMap: { [key: string]: string } = {
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
  const [visitPlans, setVisitPlans] = useState<VisitPlan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(getCurrentDayInSerbian());
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
        .eq("dan_obilaska", today)
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

      console.log("Fetched customers:", customersData?.length);
      console.log("Sample customer dan_posete:", customersData?.[0]?.dan_posete);

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

    // Set up real-time subscription for customer updates
    const channel = supabase
      .channel('kupci_darko-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kupci_darko'
        },
        (payload) => {
          console.log('Real-time customer update received:', payload);
          toast.success("Podaci o kupcima su ažurirani");
          fetchData(); // Reload all data when customer changes are detected
        }
      )
      .subscribe((status) => {
        console.log('Customer changes subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
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
        />
      </div>
    </div>
  );
};

export default VisitPlans;
