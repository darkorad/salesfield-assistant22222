import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export const PriceFormHeader = ({ title }: { title: string }) => (
  <CardHeader>
    <CardTitle className="text-lg">{title}</CardTitle>
  </CardHeader>
);