
import React from "react";
import { format } from "date-fns";

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
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
          <button 
            onClick={onRetry} 
            className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 py-1 px-2 rounded"
          >
            Pokušaj ponovo
          </button>
        </div>
      )}
    </>
  );
};
