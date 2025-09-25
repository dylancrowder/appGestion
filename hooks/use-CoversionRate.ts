"use client";

import { create } from "zustand";
import { toast } from "sonner"; // ✅ Import de Sonner

interface ConversionRateState {
  conversionRate: number | null;
  setConversionRate: (rate: number) => void;
  fetchConversionRate: () => Promise<void>;
  saveConversionRate: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_RATE = 1.66;

export const useConversionRate = create<ConversionRateState>((set, get) => ({
  conversionRate: null,

  setConversionRate: (rate: number) => set({ conversionRate: rate }),

  fetchConversionRate: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Usuario no autenticado");

      const res = await fetch(`${API_URL}/exchange-rate`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 404) {
          const createRes = await fetch(`${API_URL}/exchange-rate/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ currentExchangeRate: DEFAULT_RATE }),
          });

          if (!createRes.ok)
            throw new Error("Error al crear la tasa de conversión");

          set({ conversionRate: DEFAULT_RATE });
          toast.success("✅ Tasa de conversión creada con valor por defecto"); // ✅
          return;
        }
        throw new Error("Error al obtener la tasa de conversión");
      }

      const data = await res.json();
      set({ conversionRate: data.currentExchangeRate ?? DEFAULT_RATE });
    } catch (err: any) {
      console.error(err);
      toast.error("❌ " + err.message); // ✅
      set({ conversionRate: DEFAULT_RATE });
    }
  },

  saveConversionRate: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Usuario no autenticado");

      const rate = get().conversionRate;
      if (rate === null) throw new Error("Tasa de conversión no cargada");

      const res = await fetch(`${API_URL}/exchange-rate/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentExchangeRate: rate }),
      });

      if (!res.ok) throw new Error("Error al actualizar la tasa de conversión");

      toast.success("✅ Tasa de conversión actualizada"); // ✅
    } catch (err: any) {
      console.error(err);
      toast.error("❌ " + err.message); // ✅
    }
  },
}));
