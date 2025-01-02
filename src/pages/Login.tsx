import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/sales");
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/sales");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        background: "linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)"
      }}
    >
      <Card className="w-full max-w-md p-8 space-y-8 shadow-xl bg-white/90 backdrop-blur-sm">
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center animate-[fade-in_0.3s_ease-out]">
            <img 
              src="/lovable-uploads/46d09936-801a-49ed-b585-95bccf81c0c8.png" 
              alt="ŽIR-MD COMPANY Logo" 
              className="h-32 w-auto mb-4 animate-[scale-in_0.2s_ease-out]"
            />
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              ŽIR-MD COMPANY
            </h1>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Prijava
            </h2>
            <p className="text-sm text-gray-600">
              Prijavite se da biste pristupili aplikaciji
            </p>
          </div>
        </div>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            style: {
              button: {
                background: '#1A1F2C',
                color: 'white',
                borderRadius: '8px',
              },
              input: {
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
              },
              anchor: {
                color: '#1A1F2C',
              },
            },
            className: {
              container: 'space-y-4',
              button: 'w-full px-4 py-2 hover:bg-primary/90 transition-colors duration-200',
              input: 'w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200',
              label: 'block text-sm font-medium text-gray-700 mb-1'
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