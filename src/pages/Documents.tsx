
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { getStoredFiles, StoredFile } from "@/utils/fileStorage";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Documents = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [activeTab, setActiveTab] = useState("documents");

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        toast.error("Niste prijavljeni");
        navigate("/login");
        return;
      }

      loadFiles();
    };

    checkAuth();
  }, [navigate, isAuthenticated]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const storedFiles = await getStoredFiles();
      setFiles(storedFiles);
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Greška pri učitavanju dokumenata");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFiles = () => {
    loadFiles();
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Dokumenti</TabsTrigger>
          <TabsTrigger value="sales" onClick={() => navigateTo('/sales')}>Prodaja</TabsTrigger>
          <TabsTrigger value="settings" onClick={() => navigateTo('/settings')}>Podešavanja</TabsTrigger>
          <TabsTrigger value="daily-orders" onClick={() => navigateTo('/daily-orders')}>Dnevni nalozi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Dokumenti</span>
                  <Button 
                    variant="outline" 
                    onClick={refreshFiles}
                  >
                    Osveži
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm bg-muted/30 p-3 mb-4 rounded-md flex gap-2">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p>
                    Ovde su sačuvani svi vaši izveštaji. Možete ih otvoriti, preuzeti ili poslati nekome.
                    Dokumenti se čuvaju u vašoj aplikaciji i dostupni su i kada niste povezani na internet.
                  </p>
                </div>
                
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="w-full h-12" />
                    <Skeleton className="w-full h-12" />
                    <Skeleton className="w-full h-12" />
                  </div>
                ) : (
                  <DocumentsList files={files} onRefresh={refreshFiles} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documents;
