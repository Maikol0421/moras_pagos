"use server";

import { revalidatePath } from "next/cache";
import { academiaSchema, grupoSchema, planSchema, primerMensajeError } from "./schemas";
import { obtenerStore } from "./store";
import type { Academia, Grupo, Plan } from "./types";

export type ResultadoAccion = { ok: true } | { ok: false; error: string };

let contador = 0;
function nuevoId(prefijo: string): string {
  contador += 1;
  return `${prefijo}-${Date.now()}-${contador}`;
}

function revalidarConfig() {
  revalidatePath("/dashboard/academias");
  revalidatePath("/dashboard/planes");
  revalidatePath("/dashboard/alumnos");
  revalidatePath("/dashboard/asistencia");
  revalidatePath("/dashboard/pagos");
  revalidatePath("/dashboard/reportes");
  revalidatePath("/dashboard");
}

function datosAcademia(formData: FormData) {
  return {
    nombre: formData.get("nombre"),
    tipoCobro: formData.get("tipoCobro"),
    diaCorte: formData.get("diaCorte"),
    diasGracia: formData.get("diasGracia"),
    color: formData.get("color"),
  };
}

export async function crearAcademiaAction(
  _estadoPrevio: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = academiaSchema.safeParse(datosAcademia(formData));
  if (!parsed.success) return { ok: false, error: primerMensajeError(parsed.error) };

  const store = obtenerStore();
  const academia: Academia = { id: nuevoId("academia"), activa: true, ...parsed.data };
  store.academias.push(academia);

  revalidarConfig();
  return { ok: true };
}

export async function actualizarAcademiaAction(
  academiaId: string,
  _estadoPrevio: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = academiaSchema.safeParse(datosAcademia(formData));
  if (!parsed.success) return { ok: false, error: primerMensajeError(parsed.error) };

  const store = obtenerStore();
  const academia = store.academias.find((a) => a.id === academiaId);
  if (!academia) return { ok: false, error: "Academia no encontrada." };
  Object.assign(academia, parsed.data);

  revalidarConfig();
  return { ok: true };
}

export async function cambiarActivaAcademiaAction(academiaId: string, activa: boolean): Promise<ResultadoAccion> {
  const store = obtenerStore();
  const academia = store.academias.find((a) => a.id === academiaId);
  if (!academia) return { ok: false, error: "Academia no encontrada." };
  academia.activa = activa;

  revalidarConfig();
  return { ok: true };
}

export async function crearGrupoAction(
  _estadoPrevio: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = grupoSchema.safeParse({
    academiaId: formData.get("academiaId"),
    nombre: formData.get("nombre"),
  });
  if (!parsed.success) return { ok: false, error: primerMensajeError(parsed.error) };

  const store = obtenerStore();
  if (!store.academias.some((a) => a.id === parsed.data.academiaId)) {
    return { ok: false, error: "La academia no existe." };
  }

  const orden = store.grupos.filter((g) => g.academiaId === parsed.data.academiaId).length + 1;
  const grupo: Grupo = { id: nuevoId("grupo"), orden, ...parsed.data };
  store.grupos.push(grupo);

  revalidarConfig();
  return { ok: true };
}

export async function renombrarGrupoAction(
  grupoId: string,
  _estadoPrevio: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const nombre = formData.get("nombre");
  if (typeof nombre !== "string" || nombre.trim().length < 2) {
    return { ok: false, error: "El nombre debe tener al menos 2 caracteres." };
  }

  const store = obtenerStore();
  const grupo = store.grupos.find((g) => g.id === grupoId);
  if (!grupo) return { ok: false, error: "Grupo no encontrado." };
  grupo.nombre = nombre.trim();

  revalidarConfig();
  return { ok: true };
}

function datosPlan(formData: FormData) {
  return {
    academiaId: formData.get("academiaId"),
    nombre: formData.get("nombre"),
    costo: formData.get("costo"),
    numeroClases: formData.get("numeroClases"),
  };
}

export async function crearPlanAction(
  _estadoPrevio: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = planSchema.safeParse(datosPlan(formData));
  if (!parsed.success) return { ok: false, error: primerMensajeError(parsed.error) };

  const store = obtenerStore();
  if (!store.academias.some((a) => a.id === parsed.data.academiaId)) {
    return { ok: false, error: "La academia no existe." };
  }

  const plan: Plan = { id: nuevoId("plan"), activo: true, ...parsed.data };
  store.planes.push(plan);

  revalidarConfig();
  return { ok: true };
}

export async function actualizarPlanAction(
  planId: string,
  _estadoPrevio: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = planSchema.safeParse(datosPlan(formData));
  if (!parsed.success) return { ok: false, error: primerMensajeError(parsed.error) };

  const store = obtenerStore();
  const plan = store.planes.find((p) => p.id === planId);
  if (!plan) return { ok: false, error: "Plan no encontrado." };
  Object.assign(plan, parsed.data);

  revalidarConfig();
  return { ok: true };
}

export async function cambiarActivoPlanAction(planId: string, activo: boolean): Promise<ResultadoAccion> {
  const store = obtenerStore();
  const plan = store.planes.find((p) => p.id === planId);
  if (!plan) return { ok: false, error: "Plan no encontrado." };
  plan.activo = activo;

  revalidarConfig();
  return { ok: true };
}
