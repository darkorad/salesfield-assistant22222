
import React from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PermissionErrorScreenProps {
  onRetry: () => void;
}

export const PermissionErrorScreen: React.FC<PermissionErrorScreenProps> = ({ onRetry }) => {
  const handleSignOut = () => {
    supabase.auth.signOut().then(() => window.location.reload());
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4">
      <div className="text-red-600 text-2xl font-bold mb-4">Greška pristupa</div>
      <div className="bg-gray-100 p-4 rounded-md max-w-md">
        <p className="text-center mb-4">
          Nemate odgovarajuće dozvole za pristup podacima. Molimo kontaktirajte administratora sistema.
        </p>
        <div className="flex gap-2 mt-4">
          <button 
            onClick={handleSignOut} 
            className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Odjava
          </button>
          <button 
            onClick={onRetry} 
            className="flex-1 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Pokušaj ponovo
          </button>
        </div>
      </div>
    </div>
  );
};
