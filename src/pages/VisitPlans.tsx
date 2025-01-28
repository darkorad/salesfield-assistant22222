import { useEffect, useState } from "react";
import { Calendar, List, MapPin } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [isLoading, setIsLoading] = useState(true);

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
          .eq("user_id", session.session?.user.id);

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
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Plan poseta</h1>
        <p className="text-gray-600">Pregled nedeljnih planova poseta</p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Kalendar
          </TabsTrigger>
          <TabsTrigger value="map">
            <MapPin className="h-4 w-4 mr-2" />
            Mapa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dan</TableHead>
                  <TableHead>Kupac</TableHead>
                  <TableHead>Adresa</TableHead>
                  <TableHead>Vreme</TableHead>
                  <TableHead>Napomene</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>{plan.visit_day}</TableCell>
                    <TableCell>{plan.customer?.name}</TableCell>
                    <TableCell>
                      {plan.customer?.address}, {plan.customer?.city}
                    </TableCell>
                    <TableCell>{plan.visit_time}</TableCell>
                    <TableCell>{plan.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <div className="text-center py-12 text-gray-500">
            Kalendarski prikaz će biti dostupan uskoro
          </div>
        </TabsContent>

        <TabsContent value="map">
          <div className="text-center py-12 text-gray-500">
            Prikaz na mapi će biti dostupan uskoro
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VisitPlans;