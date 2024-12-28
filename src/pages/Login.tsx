import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/sales", { replace: true });
      }
    });

    // Check for existing session only once on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/sales", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">
            ŽIR-MD COMPANY
          </h1>
          <h2 className="text-2xl font-bold tracking-tight">Prijava</h2>
          <p className="mt-2 text-sm text-gray-600">
            Prijavite se da biste pristupili aplikaciji
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            className: {
              container: 'space-y-4',
              button: 'w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded',
              input: 'w-full px-3 py-2 border rounded',
              label: 'block text-sm font-medium text-gray-700'
            }
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email adresa',
                password_label: 'Lozinka',
                button_label: 'Prijava',
                loading_button_label: 'Prijavljivanje...',
                link_text: 'Već imate nalog? Prijavite se'
              },
              sign_up: {
                email_label: 'Email adresa',
                password_label: 'Lozinka',
                button_label: 'Registracija',
                loading_button_label: 'Registracija u toku...',
                link_text: 'Nemate nalog? Registrujte se'
              }
            }
          }}
        />
      </Card>
    </div>
  );
};

export default Login;