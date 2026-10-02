import "server-only";
import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = { usuarioId: string };

export const SESSION_COOKIE = "academia_session";
export const SESSION_MAX_AGE_SEGUNDOS = 60 * 60 * 8; // 8h

function obtenerClaveSecreta() {
  // Fallback solo para desarrollo local sin .env — en producción, definir JWT_SECRET.
  const secreto = process.env.JWT_SECRET ?? "academia-demo-dev-secret-cambiar-en-produccion";
  return new TextEncoder().encode(secreto);
}

export async function crearSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEGUNDOS}s`)
    .sign(obtenerClaveSecreta());
}

export async function verificarSessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, obtenerClaveSecreta());
    if (typeof payload.usuarioId !== "string") return null;
    return { usuarioId: payload.usuarioId };
  } catch {
    return null;
  }
}
