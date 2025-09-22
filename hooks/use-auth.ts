"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

interface LoginForm {
  email: string;
  password: string;
}

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async ({ email, password }: LoginForm) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("eesta es la data del login", data);

      if (!res.ok) {
        const msg = data.message || "Error desconocido";
        setError(msg);
        toast({
          title: "❌ Error al iniciar sesión",
          description: msg,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Guardar tokens y datos de usuario
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("email", data.email);
      if (data.name) localStorage.setItem("name", data.name);

      toast({
        title: "✅ Login exitoso",
        description: `Bienvenido, ${data.name || data.email} 👋`,
      });

      setLoading(false);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "❌ Error",
        description: err.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("email");
    localStorage.removeItem("name");

    toast({
      title: "👋 Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });

    router.push("/login");
  };

  const getUser = () => {
    return {
      email: localStorage.getItem("email"),
      name: localStorage.getItem("name"),
    };
  };

  return { login, logout, getUser, loading, error };
};
