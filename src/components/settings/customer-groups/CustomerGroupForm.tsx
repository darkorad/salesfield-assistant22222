import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const CustomerGroupForm = ({ onGroupCreated }: { onGroupCreated: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Unesite naziv grupe");
      return;
    }

    try {
      const { error } = await supabase
        .from('customer_groups')
        .insert({ name, description });

      if (error) throw error;

      toast.success("Grupa je uspešno kreirana");
      setName("");
      setDescription("");
      onGroupCreated();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error("Greška pri kreiranju grupe");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="font-medium text-lg mb-4">Nova grupa kupaca</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">Naziv grupe</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="npr. MC Kupci"
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Opis (opciono)</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opis grupe"
          className="w-full"
        />
      </div>

      <Button type="submit" className="w-full">
        Kreiraj grupu
      </Button>
    </form>
  );
};