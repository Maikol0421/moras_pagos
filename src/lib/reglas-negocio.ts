import type { Academia, Alumno, Asistencia, EstadoPago, Pago, Plan } from "./types";

export function formatearFecha(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function hoyISO(): string {
  return formatearFecha(new Date());
}

export function periodoDeFecha(fechaISO: string): string {
  return fechaISO.slice(0, 7);
}

export function periodoActual(): string {
  return periodoDeFecha(hoyISO());
}

function ultimoDiaDelMes(anio: number, mesIndex0: number): number {
  return new Date(anio, mesIndex0 + 1, 0).getDate();
}

export function sumarDias(fechaISO: string, dias: number): string {
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  fecha.setDate(fecha.getDate() + dias);
  return formatearFecha(fecha);
}

export function diferenciaEnDias(a: string, b: string): number {
  const [a1, a2, a3] = a.split("-").map(Number);
  const [b1, b2, b3] = b.split("-").map(Number);
  const fa = new Date(a1, a2 - 1, a3).getTime();
  const fb = new Date(b1, b2 - 1, b3).getTime();
  return Math.round((fa - fb) / 86400000);
}

export function sumarMeses(periodo: string, meses: number): string {
  const [anio, mes] = periodo.split("-").map(Number);
  const fecha = new Date(anio, mes - 1 + meses, 1);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

export function ultimosPeriodos(cantidad: number, finPeriodo: string = periodoActual()): string[] {
  const periodos: string[] = [];
  for (let i = cantidad - 1; i >= 0; i -= 1) {
    periodos.push(sumarMeses(finPeriodo, -i));
  }
  return periodos;
}

const FORMATO_MES = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" });
const FORMATO_MES_CORTO = new Intl.DateTimeFormat("es-MX", { month: "short" });

export function nombrePeriodo(periodo: string): string {
  const [anio, mes] = periodo.split("-").map(Number);
  const texto = FORMATO_MES.format(new Date(anio, mes - 1, 1));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function nombrePeriodoCorto(periodo: string): string {
  const [anio, mes] = periodo.split("-").map(Number);
  const texto = FORMATO_MES_CORTO.format(new Date(anio, mes - 1, 1));
  return texto.replace(".", "").replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Día de vencimiento de la mensualidad de un alumno en un periodo dado.
 * Calendario: mismo día (diaCorte) de la academia para todos los alumnos.
 * Aniversario: día del mes en que el alumno se inscribió.
 */
export function calcularVencimiento(academia: Academia, alumno: Alumno, periodo: string): string {
  const [anio, mes] = periodo.split("-").map(Number);
  const mesIndex0 = mes - 1;
  const diaObjetivo =
    academia.tipoCobro === "calendario" ? academia.diaCorte : Number(alumno.fechaInscripcion.split("-")[2]);
  const diaFinal = Math.min(diaObjetivo, ultimoDiaDelMes(anio, mesIndex0));
  return formatearFecha(new Date(anio, mesIndex0, diaFinal));
}

export function calcularFechaLimiteSinRecargo(academia: Academia, vencimiento: string): string {
  return sumarDias(vencimiento, academia.diasGracia);
}

export function calcularEstadoPago(
  pago: Pick<Pago, "fechaPago" | "fechaLimiteSinRecargo">,
  hoyISOValue: string = hoyISO(),
): EstadoPago {
  if (pago.fechaPago) return "pagado";
  return diferenciaEnDias(hoyISOValue, pago.fechaLimiteSinRecargo) > 0 ? "atrasado" : "pendiente";
}

export function clasesRestantes(
  plan: Plan,
  asistencias: Asistencia[],
  alumnoId: string,
  periodo: string = periodoActual(),
): number {
  const tomadas = asistencias.filter(
    (a) => a.alumnoId === alumnoId && a.periodo === periodo && a.presente,
  ).length;
  return Math.max(plan.numeroClases - tomadas, 0);
}

export function alumnoEstaActivo(alumno: Alumno, pagos: Pago[], periodo: string = periodoActual()): boolean {
  if (alumno.baja) return false;
  const pago = pagos.find((p) => p.alumnoId === alumno.id && p.periodo === periodo);
  if (!pago) return false;
  return calcularEstadoPago(pago) === "pagado";
}

export function ingresosDelPeriodo(pagos: Pago[], periodo: string): number {
  return pagos
    .filter((p) => p.fechaPago && periodoDeFecha(p.fechaPago) === periodo)
    .reduce((total, p) => total + p.monto, 0);
}

/**
 * Etiqueta corta para ejes de gráficas angostas (móvil): quita el prefijo
 * redundante "Academia de ", se queda con el texto antes de un "·" (ej. "Nivel
 * 1 · Principiantes" -> "Nivel 1") y recorta con elipsis si aún así es larga.
 */
export function etiquetaCorta(nombre: string, maxLargo = 16): string {
  const base = nombre.replace(/^Academia de\s+/i, "").split("·")[0].trim();
  return base.length > maxLargo ? `${base.slice(0, maxLargo - 1).trim()}…` : base;
}

export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(
    valor,
  );
}

/**
 * Versión corta para etiquetas de gráfica donde el monto completo ("$55,411")
 * se amontona (ejes/etiquetas en móvil): "$55K", "$2K", "$1.3M". El valor
 * exacto sigue disponible en el tooltip, que usa `formatearMoneda`.
 */
export function formatearMonedaCompacta(valor: number): string {
  const absoluto = Math.abs(valor);
  if (absoluto >= 1_000_000) {
    return `$${(valor / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (absoluto >= 1_000) {
    return `$${Math.round(valor / 1_000)}K`;
  }
  return `$${Math.round(valor)}`;
}
