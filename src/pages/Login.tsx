import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

// Define literal types for the table names to ensure type safety
type CustomerTableNames = "KupciVeljko" | "Kupci Darko";
type ProductTableNames = "CenovnikVeljko";

type SourceTables = {
  customers: CustomerTableNames | null;
  products: ProductTableNames | null;
};

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
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
              const { error: deleteError } = await supabase
                .from('customers')
                .delete()
                .eq('user_id', session.user.id);

              if (deleteError) {
                console.error('Error deleting existing customers:', deleteError);
                throw deleteError;
              }

              // Transform and insert new customers
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

              // Insert customers in batches to avoid potential size limits
              const batchSize = 50;
              for (let i = 0; i < transformedCustomers.length; i += batchSize) {
                const batch = transformedCustomers.slice(i, i + batchSize);
                const { error: insertError } = await supabase
                  .from('customers')
                  .insert(batch);

                if (insertError) {
                  console.error('Error inserting customers:', insertError);
                  throw insertError;
                }
              }
              
              console.log('Successfully synced customers');
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
              const { error: deleteError } = await supabase
                .from('products')
                .delete()
                .eq('user_id', session.user.id);

              if (deleteError) {
                console.error('Error deleting existing products:', deleteError);
                throw deleteError;
              }

              // Transform and insert new products
              const transformedProducts = productsData.map(product => ({
                user_id: session.user.id,
                Naziv: product['Naziv'],
                Proizvođač: product['Proizvođač'],
                Cena: product['Cena'],
                'Jedinica mere': product['Jedinica mere']
              }));

              // Insert products in batches
              const batchSize = 50;
              for (let i = 0; i < transformedProducts.length; i += batchSize) {
                const batch = transformedProducts.slice(i, i + batchSize);
                const { error: insertError } = await supabase
                  .from('products')
                  .insert(batch);

                if (insertError) {
                  console.error('Error inserting products:', insertError);
                  throw insertError;
                }
              }
              
              console.log('Successfully synced products');
            }
          }

          toast.success('Successfully logged in and synced data');
          navigate("/sales");
        } catch (error) {
          console.error('Error syncing data:', error);
          toast.error('Error syncing data');
        }
      }
    });
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