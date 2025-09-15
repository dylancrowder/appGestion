// components/customUI/drawer.tsx
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface DrawerCartProps {
  children: ReactNode;
  className?: string; // permitir pasar clases
}

export function DrawerCart({ children, className }: DrawerCartProps) {
  return (
    <Card >
      <CardContent>{children}</CardContent>
    </Card>
  );
}
