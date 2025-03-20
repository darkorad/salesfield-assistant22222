
import React from "react";

interface ConnectionErrorMessageProps {
  error: string | null;
  onRetry: () => void;
}

export const ConnectionErrorMessage = ({ error, onRetry }: ConnectionErrorMessageProps) => {
  if (!error) return null;
  
  return (
    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
      <p className="text-sm text-red-600">
        <strong>Greška povezivanja:</strong> {error}
      </p>
      <p className="text-xs text-red-500 mt-1">
        Potrebno je da imate pravilno podešene DNS zapise i pristup internetu.
      </p>
      <div className="mt-2 p-2 bg-white rounded text-xs font-mono border border-red-100">
        olkyepnvfwchgkmxyqku.supabase.co → CNAME → olkyepnvfwchgkmxyqku.supabase.co
      </div>
      <button 
        onClick={onRetry} 
        className="mt-2 w-full py-1 bg-red-100 text-red-700 text-xs rounded-md hover:bg-red-200"
      >
        Pokušaj ponovo
      </button>
    </div>
  );
};
