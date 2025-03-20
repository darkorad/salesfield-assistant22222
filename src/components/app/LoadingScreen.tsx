
import React from 'react';

export const LoadingScreen = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
      <p className="text-gray-600">Učitavanje aplikacije...</p>
    </div>
  );
};
