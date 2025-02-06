import { useEffect, useState } from "react";
import { Plus, Calendar } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface Customer {
  id: string;
  name: string;
  address: string;
  city: string;
  dan_obilaska: string | null;
}

const DAYS_OF_WEEK = [
  "Ponedeljak",
  "Utorak",
  "Sreda",
  "Četvrtak",
  "Petak",
  "Subota",
  "Nedelja"
];

const VisitPlans = () => {
  const [visitPlans, setVisitPlans] = useState<VisitPlan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'EEEE').toLowerCase());
  const today = format(new Date(), 'yyyy-MM-dd');

  const getDayCustomers = (day: string) => {
    return customers.filter(customer => {
      const customerDay = customer.dan_obilaska?.toLowerCase().trim();
      const searchDay = day.toLowerCase().trim();
      return customerDay === searchDay;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Niste prijavljeni");
          return;
        }

        // Fetch visit plans for today
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

        // Fetch all customers with their dan_obilaska
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

      <Tabs defaultValue={selectedDay} onValueChange={setSelectedDay} className="w-full">
        <TabsList className="w-full flex flex-wrap gap-1 justify-start mb-6">
          {DAYS_OF_WEEK.map((day) => (
            <TabsTrigger 
              key={day} 
              value={day.toLowerCase()}
              className="flex-1 min-w-0 px-2"
            >
              {day}
            </TabsTrigger>
          ))}
        </TabsList>

        {DAYS_OF_WEEK.map((day) => (
          <TabsContent key={day} value={day.toLowerCase()}>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  {day}
                </h2>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kupac</TableHead>
                    <TableHead>Adresa</TableHead>
                    <TableHead>Grad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getDayCustomers(day).map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.address}</TableCell>
                      <TableCell>{customer.city}</TableCell>
                    </TableRow>
                  ))}
                  {getDayCustomers(day).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        Nema planiranih poseta za ovaj dan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Današnje posete</h2>
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
                  {visitPlans.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500">
                        Nema planiranih poseta za danas
                      </TableCell>
                    </TableRow>
                  )}
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
    </div>
  );
};

export default VisitPlans;
