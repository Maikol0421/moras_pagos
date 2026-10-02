import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verificarSessionToken } from "./auth";
import { obtenerStore } from "./store";
import type { Usuario } from "./types";

export const getSesionActual = cache(async (): Promise<Usuario | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verificarSessionToken(token);
  if (!payload) return null;
  return obtenerStore().usuarios.find((u) => u.id === payload.usuarioId) ?? null;
});

export async function requireSesionActual(): Promise<Usuario> {
  const usuario = await getSesionActual();
  if (!usuario) redirect("/sesion-invalida");
  return usuario;
}
