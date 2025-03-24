
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ReactNode } from "react";

interface DeleteDocumentDialogProps {
  fileName: string;
  onDelete: () => void;
  children: ReactNode;
  variant?: "outline" | "ghost";
  size?: "sm" | "default";
  disabled?: boolean;
  mobileView?: boolean;
}

export const DeleteDocumentDialog = ({
  fileName,
  onDelete,
  children,
  variant = "ghost",
  size = "sm",
  disabled = false,
  mobileView = false
}: DeleteDocumentDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`${mobileView ? "flex-1" : ""} ${variant === "ghost" ? "text-destructive" : ""}`}
          disabled={disabled}
        >
          {mobileView ? (
            <>
              <Trash2 className="mr-1 h-4 w-4" />
              <span>Obriši</span>
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Obriši</span>
            </>
          )}
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Obriši dokument</AlertDialogTitle>
          <AlertDialogDescription>
            Da li ste sigurni da želite da obrišete dokument "{fileName}"? 
            Ova akcija je nepovratna.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Otkaži</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Obriši
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
