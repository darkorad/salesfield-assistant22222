import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          // Get user email
          const userEmail = session.user.email;
          
          // If it's Veljko's email, sync his data
          if (userEmail === 'zirmd.veljko@gmail.com') {
            // Copy data from KupciVeljko to customers table
            const { data: customersData, error: customersError } = await supabase
              .from('KupciVeljko')
              .select('*');

            if (customersError) throw customersError;

            // Transform and insert the data into customers table
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

            // Copy data from CenovnikVeljko to products table
            const { data: productsData, error: productsError } = await supabase
              .from('CenovnikVeljko')
              .select('*');

            if (productsError) throw productsError;

            // Transform and insert the data into products table
            if (productsData) {
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

              if (insertError) throw insertError;
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

    // Also listen for auth errors
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        toast.error('Authentication failed');
      }
    });

    return () => subscription.unsubscribe();
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
            redirectTo={`${window.location.origin}/sales`}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;