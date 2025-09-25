// ConversionRateInput.tsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useConversionRate } from "@/hooks/use-CoversionRate";

interface ConversionRateInputProps {
  className?: string;
}

export default function ConversionRateInput({ className }: ConversionRateInputProps) {
  const { conversionRate, setConversionRate, fetchConversionRate, saveConversionRate } = useConversionRate();
  const [localRate, setLocalRate] = useState<number | "">(""); // start vacío

  // Cargar tasa al montar
  useEffect(() => { fetchConversionRate(); }, [fetchConversionRate]);

  // Actualizar input local cuando cambie la tasa global
  useEffect(() => {
    if (conversionRate !== null) setLocalRate(conversionRate);
  }, [conversionRate]);

  const handleSave = async () => {
    if (localRate !== "" && !isNaN(localRate)) {
      setConversionRate(localRate);
      await saveConversionRate();
    }
  };

  return (
    <div className={className}>
      <Label>Tasa de cambio CLP → ARS</Label>
      <div className="flex gap-2 items-end">
        <Input
          type="number"
          value={localRate}
          placeholder="Cargando..."
          step={0.01}
          min={0}
          onChange={(e) => setLocalRate(parseFloat(e.target.value))}
        />
        <Button onClick={handleSave} disabled={localRate === ""}>
          Guardar tasa
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Ajusta la tasa de conversión usada para calcular costos y ganancias en ARS.
      </p>
    </div>
  );
}
