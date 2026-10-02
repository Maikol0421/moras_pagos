"use server";

import { revalidatePath } from "next/cache";
import { hoyISO } from "./reglas-negocio";
import { primerMensajeError, registrarPagoSchema } from "./schemas";
import { obtenerStore } from "./store";

export type ResultadoAccion = { ok: true } | { ok: false; error: string };

function revalidarTodo(alumnoId: string) {
  revalidatePath("/dashboard/pagos");
  revalidatePath("/dashboard/alumnos");
  revalidatePath(`/dashboard/alumnos/${alumnoId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reportes");
}

export async function registrarPagoAction(
  _estadoPrevio: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const parsed = registrarPagoSchema.safeParse({
    pagoId: formData.get("pagoId"),
    metodoPago: formData.get("metodoPago"),
  });
  if (!parsed.success) return { ok: false, error: primerMensajeError(parsed.error) };

  const store = obtenerStore();
  const pago = store.pagos.find((p) => p.id === parsed.data.pagoId);
  if (!pago) return { ok: false, error: "Pago no encontrado." };
  if (pago.fechaPago) return { ok: false, error: "Este pago ya estaba registrado como pagado." };

  pago.fechaPago = hoyISO();
  pago.metodoPago = parsed.data.metodoPago;

  revalidarTodo(pago.alumnoId);
  return { ok: true };
}

export async function revertirPagoAction(pagoId: string): Promise<ResultadoAccion> {
  const store = obtenerStore();
  const pago = store.pagos.find((p) => p.id === pagoId);
  if (!pago) return { ok: false, error: "Pago no encontrado." };

  pago.fechaPago = null;
  pago.metodoPago = null;

  revalidarTodo(pago.alumnoId);
  return { ok: true };
}
