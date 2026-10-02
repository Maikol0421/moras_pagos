import "server-only";
import { generarDatosSemilla } from "./seed";
import type { Store } from "./types";

declare global {
  var __academiaStore: Store | undefined;
}

/**
 * Store en memoria para la demo (sin base de datos todavía). Singleton en
 * globalThis para sobrevivir al hot-reload de `next dev` y para que las
 * Server Actions compartan el mismo estado entre requests dentro del mismo
 * proceso. Se reinicia si se reinicia el servidor — suficiente para validar
 * el frontend antes de conectar Postgres.
 */
export function obtenerStore(): Store {
  if (!globalThis.__academiaStore) {
    globalThis.__academiaStore = generarDatosSemilla();
  }
  return globalThis.__academiaStore;
}
