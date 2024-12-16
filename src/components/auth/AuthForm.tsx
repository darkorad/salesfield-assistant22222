import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Provider } from "@supabase/supabase-js";

export const AuthForm = () => {
  return (
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
      providers={["email" as Provider]}
      redirectTo={window.location.origin}
    />
  );
};