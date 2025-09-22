"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const useProtectedRoute = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login"); // si no hay token, redirige
    } else {
      setLoading(false); // usuario válido
    }
  }, [router]);

  return { loading };
};
