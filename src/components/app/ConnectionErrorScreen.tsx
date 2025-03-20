
import React from 'react';

interface ConnectionErrorScreenProps {
  onRetry: () => void;
}

export const ConnectionErrorScreen: React.FC<ConnectionErrorScreenProps> = ({ onRetry }) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4">
      <div className="text-red-600 text-2xl font-bold mb-4">Greška povezivanja</div>
      <p className="text-center max-w-md mb-6">
        Nije moguće povezati se sa serverom. Proverite internet konekciju i DNS podešavanja.
      </p>
      <div className="bg-gray-100 p-4 rounded-md max-w-md">
        <p className="font-semibold mb-2">Potrebni DNS zapisi:</p>
        <div className="font-mono text-sm bg-white p-2 rounded border">
          olkyepnvfwchgkmxyqku.supabase.co → CNAME → olkyepnvfwchgkmxyqku.supabase.co
        </div>
        <button 
          onClick={onRetry} 
          className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Pokušaj ponovo
        </button>
      </div>
    </div>
  );
};
