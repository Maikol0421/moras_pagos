"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { crearSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SEGUNDOS } from "./auth";
import { loginSchema, primerMensajeError } from "./schemas";
import { obtenerStore } from "./store";

export type EstadoLogin = { error: string } | null;

export async function loginAction(_estadoPrevio: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: primerMensajeError(parsed.error) };
  }

  const { email, password } = parsed.data;
  const usuario = obtenerStore().usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const esValido = usuario ? await bcrypt.compare(password, usuario.passwordHash) : false;

  if (!usuario || !esValido) {
    return { error: "Correo o contraseña incorrectos." };
  }

  const token = await crearSessionToken({ usuarioId: usuario.id });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEGUNDOS,
  });

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
