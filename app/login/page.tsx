"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const registerSchema = loginSchema
  .extend({
    name: z.string().min(2, "El nombre es obligatorio"),
    confirmPassword: z.string().min(6, "Debes confirmar la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm | RegisterForm>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const onSubmit = async (data: LoginForm | RegisterForm) => {
    setMessage(null);
    setLoading(true);
    try {
      if (isLogin) {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: (data as LoginForm).email,
            password: (data as LoginForm).password,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Error en login");
console.log("esta es la data json", json);

        localStorage.setItem("accessToken", json.accessToken);
         localStorage.setItem("name", json.name);
        setMessage({ type: "success", text: "✅ Login exitoso, redirigiendo..." });

         setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: (data as RegisterForm).name,
            email: (data as RegisterForm).email,
            password: (data as RegisterForm).password,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Error en registro");

        setMessage({ type: "success", text: "✅ Registro exitoso, ya puedes iniciar sesión" });
        setIsLogin(true);
      }
      reset();
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "❌ Ocurrió un error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    setMessage(null);
  }, [isLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex justify-center mb-4">
          <Tabs value={isLogin ? "login" : "register"} onValueChange={(val) => setIsLogin(val === "login")}>
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Registro
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="grid gap-4 min-h-[380px]">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 h-full justify-between">
            <div className="flex flex-col gap-4">
              {!isLogin && (
                <div>
                  <Label>Nombre</Label>
                  <Input type="text" placeholder="Tu nombre" {...register("name")} />
                  {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
                </div>
              )}

              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="usuario@correo.com" {...register("email")} />
                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label>Contraseña</Label>
                <Input type="password" placeholder="Ingresa tu contraseña" {...register("password")} />
                {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
              </div>

              {!isLogin && (
                <div>
                  <Label>Confirmar contraseña</Label>
                  <Input type="password" placeholder="Repite tu contraseña" {...register("confirmPassword")} />
                  {errors.confirmPassword && (
                    <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              )}
            </div>

            {message && (
              <p
                className={`mt-2 text-center text-sm font-medium ${
                  message.type === "success" ? "text-green-600" : "text-destructive"
                } transition-opacity duration-500`}
              >
                {message.text}
              </p>
            )}

            <Button
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2"
              disabled={isSubmitting || loading}
            >
              {(isSubmitting || loading) && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting || loading
                ? isLogin
                  ? "Ingresando..."
                  : "Registrando..."
                : isLogin
                ? "Ingresar"
                : "Registrarse"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
