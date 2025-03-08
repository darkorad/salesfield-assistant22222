
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportSection } from "./ExportSection";
import { ImportSection } from "./ImportSection";

export const DataManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Izvoz i uvoz podataka</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ExportSection />
          <ImportSection />
        </div>
      </CardContent>
    </Card>
  );
};
