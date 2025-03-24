
import { FileSpreadsheet } from "lucide-react";

export const DocumentsEmptyState = () => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <FileSpreadsheet className="mx-auto h-12 w-12 mb-3 text-gray-400" />
      <p className="text-lg font-medium text-gray-500">Nema sačuvanih dokumenata</p>
      <p className="text-sm mt-2 text-gray-400 max-w-md mx-auto">
        Dokumenti će se pojaviti ovde kada izvezete izveštaje. Idite na stranicu "Podešavanja" da kreirate izveštaje.
      </p>
    </div>
  );
};
