import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

// Define literal types for the table names to ensure type safety
type CustomerTableNames = "KupciVeljko" | "Kupci Darko";
type ProductTableNames = "CenovnikVeljko";

type SourceTables = {
  customers: CustomerTableNames | null;
  products: ProductTableNames | null;
};

const Login = () => {
  const navigate = useNavigate();
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/sales");
      }
    };
    checkSession();

    const handleAuthChange = async (event: string, session: any) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session) {
        setIsSyncing(true);
        try {
          const userEmail = session.user.email;
          let sourceTables: SourceTables = {
            customers: null,
            products: null
          };
          
          switch(userEmail) {
            case 'zirmd.veljko@gmail.com':
              sourceTables = {
                customers: "KupciVeljko",
                products: "CenovnikVeljko"
              };
              break;
            case 'zirmd.darko@gmail.com':
              sourceTables = {
                customers: "Kupci Darko",
                products: null
              };
              break;
            default:
              toast.success('Successfully logged in');
              navigate("/sales");
              return;
          }

          // Sync customers if source table exists
          if (sourceTables.customers) {
            console.log('Syncing customers from:', sourceTables.customers);
            const { data: customersData, error: customersError } = await supabase
              .from(sourceTables.customers)
              .select('*');

            if (customersError) {
              console.error('Error fetching customers:', customersError);
              throw customersError;
            }

            if (customersData) {
              // Delete existing customers for this user
              await supabase
                .from('customers')
                .delete()
                .eq('user_id', session.user.id);

              // Transform and insert new customers in smaller batches
              const transformedCustomers = customersData.map(customer => ({
                user_id: session.user.id,
                code: customer['Šifra kupca'].toString(),
                name: customer['Naziv kupca'],
                address: customer['Adresa'],
                city: customer['Grad'],
                phone: customer['Telefon'],
                pib: customer['PIB'],
                is_vat_registered: customer['PDV Obveznik'] === 'DA',
                gps_coordinates: customer['GPS Koordinate']
              }));

              // Smaller batch size for mobile
              const batchSize = 10;
              const totalBatches = Math.ceil(transformedCustomers.length / batchSize);
              
              for (let i = 0; i < transformedCustomers.length; i += batchSize) {
                const batch = transformedCustomers.slice(i, i + batchSize);
                await supabase.from('customers').insert(batch);
                setSyncProgress((i + batchSize) / transformedCustomers.length * 50); // First 50% for customers
              }
            }
          }

          // Sync products if source table exists
          if (sourceTables.products) {
            console.log('Syncing products from:', sourceTables.products);
            const { data: productsData, error: productsError } = await supabase
              .from(sourceTables.products)
              .select('*');

            if (productsError) {
              console.error('Error fetching products:', productsError);
              throw productsError;
            }

            if (productsData) {
              // Delete existing products for this user
              await supabase
                .from('products')
                .delete()
                .eq('user_id', session.user.id);

              // Transform and insert new products in smaller batches
              const transformedProducts = productsData.map(product => ({
                user_id: session.user.id,
                Naziv: product['Naziv'],
                Proizvođač: product['Proizvođač'],
                Cena: product['Cena'],
                'Jedinica mere': product['Jedinica mere']
              }));

              // Smaller batch size for mobile
              const batchSize = 10;
              for (let i = 0; i < transformedProducts.length; i += batchSize) {
                const batch = transformedProducts.slice(i, i + batchSize);
                await supabase.from('products').insert(batch);
                setSyncProgress(50 + (i + batchSize) / transformedProducts.length * 50); // Last 50% for products
              }
            }
          }

          toast.success('Successfully logged in and synced data');
          navigate("/sales");
        } catch (error) {
          console.error('Error syncing data:', error);
          toast.error('Error syncing data');
        } finally {
          setIsSyncing(false);
          setSyncProgress(0);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            ŽIR-MD COMPANY
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSyncing && (
            <div className="mb-4 space-y-2">
              <div className="text-sm text-gray-600 text-center">Syncing data...</div>
              <Progress value={syncProgress} className="w-full" />
            </div>
          )}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#000000',
                    brandAccent: '#333333',
                  },
                },
              },
            }}
            providers={[]}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;