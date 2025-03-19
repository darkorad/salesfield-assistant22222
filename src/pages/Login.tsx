
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const Login = () => {
  const navigate = useNavigate();
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // Load stored login attempts and lockout time on component mount
  useEffect(() => {
    const storedAttempts = localStorage.getItem('loginAttempts');
    const storedLockout = localStorage.getItem('lockedUntil');
    
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts, 10));
    }
    
    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout, 10);
      if (lockoutTime > Date.now()) {
        setLockedUntil(lockoutTime);
      } else {
        // Reset if lockout has expired
        localStorage.removeItem('lockedUntil');
        localStorage.removeItem('loginAttempts');
      }
    }
  }, []);

  // Update remaining lockout time
  useEffect(() => {
    if (!lockedUntil) return;
    
    const interval = setInterval(() => {
      const remaining = lockedUntil - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setLockedUntil(null);
        setLoginAttempts(0);
        localStorage.removeItem('lockedUntil');
        localStorage.removeItem('loginAttempts');
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lockedUntil]);

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
        // Reset login attempts on successful login
        setLoginAttempts(0);
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockedUntil');
        navigate("/sales");
      } else if (event === "SIGNED_OUT") {
        navigate("/login");
      } else if (event === "USER_UPDATED") {
        // Handle user update
      } else if (event === "PASSWORD_RECOVERY") {
        // Handle password recovery
      }
    });

    // Set up a separate listener for login failures
    const handleLoginFailure = () => {
      // Track failed login attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutTime = Date.now() + LOCKOUT_DURATION;
        setLockedUntil(lockoutTime);
        localStorage.setItem('lockedUntil', lockoutTime.toString());
        toast.error(`Previše pokušaja prijave. Pokušajte ponovo za 5 minuta.`);
      }
    };

    // Handle form submission errors by attaching an event listener to the Auth UI form
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          // Wait a brief moment to see if login succeeds
          setTimeout(async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
              // If still no session after submit, consider it a failure
              handleLoginFailure();
            }
          }, 1000);
        });
      }
    }, 500);

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, loginAttempts]);

  // Format remaining time as mm:ss
  const formatRemainingTime = () => {
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const isLocked = lockedUntil !== null && lockedUntil > Date.now();

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
            {isLocked && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                <p className="font-medium">Pristup privremeno blokiran</p>
                <p className="text-sm">Previše neuspešnih pokušaja. Pokušajte ponovo za {formatRemainingTime()}.</p>
              </div>
            )}
            {!isLocked && loginAttempts > 0 && (
              <p className="text-xs text-amber-600">
                Preostali pokušaji: {MAX_LOGIN_ATTEMPTS - loginAttempts}
              </p>
            )}
          </div>
        </div>
        {isLocked ? (
          <div className="p-4 text-center text-gray-500">
            Prijava je privremeno onemogućena zbog previše neuspešnih pokušaja.
            <br />
            Pokušajte ponovo za {formatRemainingTime()}.
          </div>
        ) : (
          <Auth
            supabaseClient={supabase}
            providers={[]}
            view="sign_in"
            showLinks={false}
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
                }
              }
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default Login;
