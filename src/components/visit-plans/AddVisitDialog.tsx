import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface AddVisitDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddVisitDialog = ({ isOpen, onOpenChange }: AddVisitDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Dodaj posetu
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Dodaj novu posetu za {format(new Date(), "dd.MM.yyyy.")}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p className="text-gray-500">
            Forma za dodavanje posete će biti implementirana uskoro.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};