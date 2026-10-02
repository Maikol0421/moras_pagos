"use server";

import { revalidatePath } from "next/cache";
import { periodoDeFecha } from "./reglas-negocio";
import { asistenciaLoteSchema, primerMensajeError } from "./schemas";
import { obtenerStore } from "./store";
import type { Asistencia } from "./types";

export type ResultadoAccion = { ok: true } | { ok: false; error: string };

let contador = 0;
function nuevoId(prefijo: string): string {
  contador += 1;
  return `${prefijo}-${Date.now()}-${contador}`;
}

export async function guardarAsistenciaAction(
  _estadoPrevio: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const alumnoIdsRaw = formData.get("alumnoIds");
  let alumnoIds: string[] = [];
  try {
    alumnoIds = alumnoIdsRaw ? JSON.parse(String(alumnoIdsRaw)) : [];
  } catch {
    return { ok: false, error: "Lista de alumnos inválida." };
  }

  const registros = alumnoIds.map((alumnoId) => ({
    alumnoId,
    presente: formData.get(`presente-${alumnoId}`) === "on",
  }));

  const parsed = asistenciaLoteSchema.safeParse({
    grupoId: formData.get("grupoId"),
    fecha: formData.get("fecha"),
    registros,
  });
  if (!parsed.success) return { ok: false, error: primerMensajeError(parsed.error) };

  const store = obtenerStore();
  if (!store.grupos.some((g) => g.id === parsed.data.grupoId)) {
    return { ok: false, error: "El grupo no existe." };
  }

  store.asistencias = store.asistencias.filter(
    (a) => !(a.grupoId === parsed.data.grupoId && a.fecha === parsed.data.fecha),
  );

  const periodo = periodoDeFecha(parsed.data.fecha);
  for (const registro of parsed.data.registros) {
    const asistencia: Asistencia = {
      id: nuevoId("asistencia"),
      alumnoId: registro.alumnoId,
      grupoId: parsed.data.grupoId,
      fecha: parsed.data.fecha,
      presente: registro.presente,
      periodo,
    };
    store.asistencias.push(asistencia);
  }

  revalidatePath("/dashboard/asistencia");
  revalidatePath("/dashboard/alumnos");
  revalidatePath("/dashboard");
  return { ok: true };
}
