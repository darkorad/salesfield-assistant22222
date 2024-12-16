import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

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
      providers={[]}
      view="sign_in"
      showLinks={false}
      localization={{
        variables: {
          sign_in: {
            email_label: 'Username',
            email_input_placeholder: 'Enter your username',
            password_label: 'Password',
            password_input_placeholder: 'Enter your password',
          },
          sign_up: {
            email_label: 'Username',
            email_input_placeholder: 'Enter your username',
            password_label: 'Password',
            password_input_placeholder: 'Enter your password',
          },
        },
      }}
      redirectTo={window.location.origin}
      queryParams={{
        username_only: 'true'
      }}
    />
  );
};