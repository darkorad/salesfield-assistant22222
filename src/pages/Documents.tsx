
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { getStoredFiles, StoredFile } from "@/utils/fileStorage";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Info, 
  RefreshCw, 
  Settings, 
  ArrowLeft 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";

const Documents = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<StoredFile[]>([]);

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

  const handleGoToSettings = () => {
    navigate("/settings");
  };

  const handleGoToPlans = () => {
    navigate("/visit-plans");
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={handleGoToPlans}>Plan poseta</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dokumenti</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGoToSettings}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Podešavanja</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGoToPlans}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Plan poseta</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-t-4 border-t-accent shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  Dokumenti
                </CardTitle>
                <CardDescription>
                  Pregled svih vaših izveštaja i dokumenata
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshFiles}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Osveži</span>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-4 flex gap-2">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">O vašim dokumentima</p>
                <p>
                  Ovde su sačuvani svi vaši izveštaji. Dokumenti se čuvaju u vašoj aplikaciji 
                  i dostupni su i kada niste povezani na internet.
                </p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="w-full h-20 rounded-md" />
                <Skeleton className="w-full h-20 rounded-md" />
                <Skeleton className="w-full h-20 rounded-md" />
              </div>
            ) : (
              <DocumentsList files={files} onRefresh={refreshFiles} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documents;
