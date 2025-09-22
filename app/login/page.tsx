"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";


// -------------------- SCHEMAS --------------------
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

// -------------------- TYPES --------------------
type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

// -------------------- API --------------------
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const registerUser = async (data: RegisterForm) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      name: data.name,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error en registro");
  return json;
};

// -------------------- COMPONENTE --------------------
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, loading } = useAuth(); // usamos nuestro hook

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm | RegisterForm>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const onSubmit = async (data: LoginForm | RegisterForm) => {
    try {
      if (isLogin) {
        await login(data as LoginForm);
      } else {
        await registerUser(data as RegisterForm);
        toast({
          title: "✅ Registro exitoso",
          description: "Ya puedes iniciar sesión con tus credenciales 🚀",
        });
        setIsLogin(true); // cambiar automáticamente a login
      }
      reset();
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 h-full justify-between"
          >
            <div className="flex flex-col gap-4">
              {!isLogin && (
                <div>
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    placeholder="Tu nombre"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="usuario@correo.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {!isLogin && (
                <div>
                  <Label>Confirmar contraseña</Label>
                  <Input
                    type="password"
                    placeholder="Repite tu contraseña"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2"
              disabled={isSubmitting || loading}
            >
              {(isSubmitting || loading) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {isSubmitting || loading
                ? "Procesando..."
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
