
import React from "react";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";

interface VisitPlansHeaderProps {
  error: string | null;
  onRetry: () => void;
}

export const VisitPlansHeader: React.FC<VisitPlansHeaderProps> = ({ error, onRetry }) => {
  return (
    <>
      <div className="mb-4">
        <h1 className="text-lg font-bold mb-1">Plan poseta za {format(new Date(), 'dd.MM.yyyy.')}</h1>
        <p className="text-xs text-gray-600">Pregled današnjih poseta i rasporeda po danima</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 flex items-start">
          <AlertCircle className="text-red-500 h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 text-sm font-medium">{error}</p>
            <p className="text-red-700 text-xs mt-1">
              {error.includes("Nemate dozvolu") 
                ? "Administrator sistema treba da proveri podešavanja baze podataka i vaša korisnička prava."
                : error.includes("Niste prijavljeni")
                ? "Sesija je istekla. Molimo prijavite se ponovo."
                : "Molimo pokušajte ponovo ili kontaktirajte podršku ako problem potraje."
              }
            </p>
            <button 
              onClick={onRetry} 
              className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded-md transition-colors"
            >
              Pokušaj ponovo
            </button>
          </div>
        </div>
      )}
    </>
  );
};
