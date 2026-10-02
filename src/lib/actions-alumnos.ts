"use server";

import { revalidatePath } from "next/cache";
import { alumnoSchema, primerMensajeError } from "./schemas";
import { calcularFechaLimiteSinRecargo, calcularVencimiento, periodoActual } from "./reglas-negocio";
import { obtenerStore } from "./store";
import type { Alumno, Pago } from "./types";

export type ResultadoAccion = { ok: true } | { ok: false; error: string };

let contador = 0;
function nuevoId(prefijo: string): string {
  contador += 1;
  return `${prefijo}-${Date.now()}-${contador}`;
}

function datosFormulario(formData: FormData) {
  return {
    nombre: formData.get("nombre"),
    academiaId: formData.get("academiaId"),
    grupoId: formData.get("grupoId"),
    planId: formData.get("planId"),
    fechaInscripcion: formData.get("fechaInscripcion"),
    telefono: formData.get("telefono"),
    tutor: formData.get("tutor"),
  };
}

function validarRelaciones(
  academiaId: string,
  grupoId: string,
  planId: string,
): ResultadoAccion | null {
  const store = obtenerStore();
  const academia = store.academias.find((a) => a.id === academiaId);
  if (!academia) return { ok: false, error: "La academia seleccionada no existe." };
  if (!store.grupos.some((g) => g.id === grupoId && g.academiaId === academiaId)) {
    return { ok: false, error: "El grupo no pertenece a la academia seleccionada." };
  }
  if (!store.planes.some((p) => p.id === planId && p.academiaId === academiaId)) {
    return { ok: false, error: "El plan no pertenece a la academia seleccionada." };
  }
  return null;
}

export async function crearAlumnoAction(
  _estadoPrevio: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = alumnoSchema.safeParse(datosFormulario(formData));
  if (!parsed.success) return { ok: false, error: primerMensajeError(parsed.error) };

  const errorRelacion = validarRelaciones(parsed.data.academiaId, parsed.data.grupoId, parsed.data.planId);
  if (errorRelacion) return errorRelacion;

  const store = obtenerStore();
  const academia = store.academias.find((a) => a.id === parsed.data.academiaId)!;
  const plan = store.planes.find((p) => p.id === parsed.data.planId)!;

  const alumno: Alumno = { id: nuevoId("alumno"), baja: false, ...parsed.data };
  store.alumnos.push(alumno);

  const periodo = periodoActual();
  if (periodo >= alumno.fechaInscripcion.slice(0, 7)) {
    const vencimiento = calcularVencimiento(academia, alumno, periodo);
    const pago: Pago = {
      id: nuevoId("pago"),
      alumnoId: alumno.id,
      periodo,
      fechaVencimiento: vencimiento,
      fechaLimiteSinRecargo: calcularFechaLimiteSinRecargo(academia, vencimiento),
      fechaPago: null,
      monto: plan.costo,
      metodoPago: null,
    };
    store.pagos.push(pago);
  }

  revalidatePath("/dashboard/alumnos");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function actualizarAlumnoAction(
  alumnoId: string,
  _estadoPrevio: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = alumnoSchema.safeParse(datosFormulario(formData));
  if (!parsed.success) return { ok: false, error: primerMensajeError(parsed.error) };

  const errorRelacion = validarRelaciones(parsed.data.academiaId, parsed.data.grupoId, parsed.data.planId);
  if (errorRelacion) return errorRelacion;

  const store = obtenerStore();
  const alumno = store.alumnos.find((a) => a.id === alumnoId);
  if (!alumno) return { ok: false, error: "Alumno no encontrado." };

  Object.assign(alumno, parsed.data);

  revalidatePath("/dashboard/alumnos");
  revalidatePath(`/dashboard/alumnos/${alumnoId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function cambiarBajaAlumnoAction(alumnoId: string, baja: boolean): Promise<ResultadoAccion> {
  const store = obtenerStore();
  const alumno = store.alumnos.find((a) => a.id === alumnoId);
  if (!alumno) return { ok: false, error: "Alumno no encontrado." };

  alumno.baja = baja;

  revalidatePath("/dashboard/alumnos");
  revalidatePath(`/dashboard/alumnos/${alumnoId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
