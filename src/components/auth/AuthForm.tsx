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
      redirectTo={`${window.location.origin}/login`}
      showLinks={true}
      view="sign_in"
      localization={{
        variables: {
          sign_in: {
            email_label: 'Email',
            email_input_placeholder: 'Enter your email',
            password_label: 'Password',
            password_input_placeholder: 'Enter your password',
            button_label: 'Sign in',
          },
          sign_up: {
            email_label: 'Email',
            email_input_placeholder: 'Enter your email',
            password_label: 'Password',
            password_input_placeholder: 'Enter your password',
            button_label: 'Sign up',
          },
        },
      }}
    />
  );
};