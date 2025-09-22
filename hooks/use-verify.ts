"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useRequireAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/verify-session", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("No autenticado");
        return res.json();
      })
      .then(() => setLoading(false))
      .catch(() => {
        toast.error("❌ Debes iniciar sesión");
        router.replace("/login");
      });
  }, [router]);

  return { loading };
};
