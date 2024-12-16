import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

type SourceTables = {
  customers: "KupciVeljko" | "Kupci Darko" | null;
  products: "CenovnikVeljko" | null;
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
                customers: 'KupciVeljko',
                products: 'CenovnikVeljko'
              };
              break;
            case 'zirmd.darko@gmail.com':
              sourceTables = {
                customers: 'Kupci Darko',
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
            const { data: customersData, error: customersError } = await supabase
              .from(sourceTables.customers)
              .select('*');

            if (customersError) throw customersError;

            if (customersData) {
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

              // Delete existing customers for this user
              await supabase
                .from('customers')
                .delete()
                .eq('user_id', session.user.id);

              // Insert new customers
              const { error: insertError } = await supabase
                .from('customers')
                .insert(transformedCustomers);

              if (insertError) throw insertError;
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
              console.log('Products data:', productsData);
              const transformedProducts = productsData.map(product => ({
                user_id: session.user.id,
                Naziv: product['Naziv'],
                Proizvođač: product['Proizvođač'],
                Cena: product['Cena'],
                'Jedinica mere': product['Jedinica mere']
              }));

              // Delete existing products for this user
              await supabase
                .from('products')
                .delete()
                .eq('user_id', session.user.id);

              // Insert new products
              const { error: insertError } = await supabase
                .from('products')
                .insert(transformedProducts);

              if (insertError) {
                console.error('Error inserting products:', insertError);
                throw insertError;
              }
            }
          }

          toast.success('Successfully logged in');
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