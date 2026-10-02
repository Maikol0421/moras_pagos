import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Ingresa un correo válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export const tipoCobroSchema = z.enum(["calendario", "aniversario"]);

export const academiaSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  tipoCobro: tipoCobroSchema,
  diaCorte: z.coerce
    .number()
    .int("Debe ser un número entero.")
    .min(1, "Debe ser un día entre 1 y 28.")
    .max(28, "Debe ser un día entre 1 y 28."),
  diasGracia: z.coerce
    .number()
    .int("Debe ser un número entero.")
    .min(0, "No puede ser negativo.")
    .max(30, "Máximo 30 días."),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Usa un color hexadecimal, ej. #4F46E5."),
});

export const grupoSchema = z.object({
  academiaId: z.string().min(1, "Selecciona una academia."),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
});

export const planSchema = z.object({
  academiaId: z.string().min(1, "Selecciona una academia."),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  costo: z.coerce.number().positive("El costo debe ser mayor a 0."),
  numeroClases: z.coerce.number().int("Debe ser un número entero.").positive("Debe incluir al menos 1 clase."),
});

export const alumnoSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  academiaId: z.string().min(1, "Selecciona una academia."),
  grupoId: z.string().min(1, "Selecciona un grupo o nivel."),
  planId: z.string().min(1, "Selecciona un plan."),
  fechaInscripcion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
  telefono: z
    .string()
    .min(10, "El teléfono debe tener 10 dígitos.")
    .max(10, "El teléfono debe tener 10 dígitos."),
  tutor: z.string().min(2, "Indica el nombre del tutor o contacto."),
});

export const registrarPagoSchema = z.object({
  pagoId: z.string().min(1),
  metodoPago: z.enum(["Efectivo", "Transferencia", "Tarjeta"]),
});

export const registroAsistenciaSchema = z.object({
  alumnoId: z.string().min(1),
  presente: z.boolean(),
});

export const asistenciaLoteSchema = z.object({
  grupoId: z.string().min(1, "Selecciona un grupo."),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
  registros: z.array(registroAsistenciaSchema).min(1, "No hay alumnos para pasar lista."),
});

export function primerMensajeError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Datos inválidos.";
}
