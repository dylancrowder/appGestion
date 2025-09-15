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

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const registerSchema = loginSchema.extend({
  confirmPassword: z.string().min(6, "Debes confirmar la contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginForm | RegisterForm>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const onSubmit = (data: LoginForm | RegisterForm) => {
    if (isLogin) {
      toast({ title: `✅ Login exitoso: ${data.email}` });
    } else {
      toast({ title: `✅ Registro exitoso: ${data.email}` });
    }
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        {/* Header con tabs */}
        <CardHeader className="flex justify-between mb-4">
          <Button
            variant={isLogin ? "secondary" : "outline"}
            onClick={() => setIsLogin(true)}
            className="flex-1"
          >
            Login
          </Button>
          <Button
            variant={!isLogin ? "secondary" : "outline"}
            onClick={() => setIsLogin(false)}
            className="flex-1"
          >
            Registro
          </Button>
        </CardHeader>

        {/* Contenido del form con altura fija */}
        <CardContent className="grid gap-4 min-h-[320px]">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 h-full justify-between">
            <div className="flex flex-col gap-4">
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="usuario@correo.com" {...register("email")} />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label>Contraseña</Label>
                <Input type="password" placeholder="Ingresa tu contraseña" {...register("password")} />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
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
                    <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Botón al final */}
            <Button type="submit" className="w-full mt-2">
              {isLogin ? "Ingresar" : "Registrarse"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
