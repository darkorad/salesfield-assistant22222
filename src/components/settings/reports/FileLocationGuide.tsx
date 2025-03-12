
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, FolderOpen, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const FileLocationGuide = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Info className="h-5 w-5 text-blue-500" />
          Kako pronaći izvezene izveštaje
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {!isExpanded ? (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsExpanded(true)}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Prikaži uputstvo
            </Button>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="font-medium pb-1 border-b">Na mobilnom telefonu:</div>
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  Otvorite aplikaciju <strong>Files</strong> ili <strong>My Files</strong> (naziv zavisi od proizvođača telefona)
                </li>
                <li>
                  <div className="flex items-center gap-1 mb-1">
                    <FolderOpen className="h-4 w-4 text-blue-500" />
                    <strong>Download</strong> folder
                  </div>
                  Većina izveštaja se čuva u Download/Preuzimanja folderu u internoj memoriji uređaja
                </li>
                <li>
                  Alternativno, izveštaji mogu biti u:
                  <ul className="list-disc pl-5 mt-1">
                    <li>Documents folderu</li>
                    <li>Internoj memoriji uređaja</li>
                    <li>U glavnom direktorijumu interne memorije</li>
                  </ul>
                </li>
                <li>
                  Koristite pretragu fajlova (obično ikonica lupe) i potražite fajl po imenu (npr. "DnevniIzvestaj")
                </li>
              </ol>

              <div className="font-medium pb-1 border-b mt-4">Na računaru:</div>
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  <div className="flex items-center gap-1 mb-1">
                    <FolderOpen className="h-4 w-4 text-blue-500" />
                    <strong>Downloads</strong> folder
                  </div>
                  Na računaru se fajlovi automatski preuzimaju u Downloads folder vašeg korisničkog profila
                </li>
                <li>
                  Možete proveriti i nedavna preuzimanja u vašem web pretraživaču (pritisnite Ctrl+J)
                </li>
              </ol>

              <Button 
                variant="ghost" 
                size="sm"
                className="mt-2"
                onClick={() => setIsExpanded(false)}
              >
                Sakrij uputstvo
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
