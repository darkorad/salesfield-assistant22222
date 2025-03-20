
import React from "react";

export const DNSTroubleshootingInfo = () => {
  return (
    <div className="mt-4 text-xs text-gray-500">
      <p className="font-semibold mb-1">Ako imate problem sa povezivanjem:</p>
      <ol className="list-decimal pl-4 space-y-1">
        <li>Proverite da li imate internet konekciju</li>
        <li>Uverite se da su DNS podešavanja ispravna</li>
        <li>Dodajte sledeće DNS zapise u vaš DNS sistem:</li>
      </ol>
      <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-xs">
        <p>olkyepnvfwchgkmxyqku.supabase.co → CNAME → olkyepnvfwchgkmxyqku.supabase.co</p>
      </div>
    </div>
  );
};
