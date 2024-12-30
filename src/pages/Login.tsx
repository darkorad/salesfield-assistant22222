import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/sales", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/sales", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-[#F1F0FB] flex items-center justify-center">
        <div className="animate-pulse text-[#403E43]">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)"
      }}
    >
      <Card className="w-full max-w-md p-8 space-y-6 bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1F2C] mb-2">
            ŽIR-MD COMPANY
          </h1>
          <h2 className="text-2xl font-bold tracking-tight text-[#403E43]">
            Prijava
          </h2>
          <p className="mt-2 text-sm text-[#8E9196]">
            Prijavite se da biste pristupili aplikaciji
          </p>
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
                borderRadius: '6px',
                padding: '10px 15px',
                height: '44px',
              },
              input: {
                background: 'white',
                borderRadius: '6px',
                padding: '10px 15px',
                height: '44px',
              },
              label: {
                color: '#403E43',
                marginBottom: '4px',
              }
            },
            className: {
              container: 'space-y-4',
              button: 'w-full font-medium hover:bg-[#2A2F3C] transition-colors',
              input: 'w-full border-[#E5DEFF] focus:border-[#9b87f5]',
              label: 'block text-sm font-medium'
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