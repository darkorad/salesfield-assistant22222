import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Contact {
  name: string;
  viber: string;
}

export const ContactSettings = () => {
  const [settings, setSettings] = useState<{
    email: string;
    contacts: Contact[];
  }>(() => {
    const saved = localStorage.getItem("contactSettings");
    return saved
      ? JSON.parse(saved)
      : {
          email: "",
          contacts: [
            { name: "ACA", viber: "" },
            { name: "PERA", viber: "" },
          ],
        };
  });

  const handleSave = () => {
    localStorage.setItem("contactSettings", JSON.stringify(settings));
    toast.success("Podešavanja su sačuvana");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Podešavanja kontakata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email adresa</label>
          <Input
            type="email"
            value={settings.email}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="Unesite email adresu"
          />
        </div>
        {settings.contacts.map((contact, index) => (
          <div key={contact.name} className="space-y-2">
            <label className="text-sm font-medium">
              Viber broj za {contact.name}
            </label>
            <Input
              type="tel"
              value={contact.viber}
              onChange={(e) => {
                const newContacts = [...settings.contacts];
                newContacts[index] = {
                  ...contact,
                  viber: e.target.value,
                };
                setSettings((prev) => ({ ...prev, contacts: newContacts }));
              }}
              placeholder={`Unesite Viber broj za ${contact.name}`}
            />
          </div>
        ))}
        <Button onClick={handleSave} className="w-full">
          Sačuvaj podešavanja
        </Button>
      </CardContent>
    </Card>
  );
};