export type TipoCobro = "calendario" | "aniversario";

export interface Academia {
  id: string;
  nombre: string;
  tipoCobro: TipoCobro;
  /** Día del mes en que vence la mensualidad cuando tipoCobro === "calendario". */
  diaCorte: number;
  /** Días de atraso permitidos (ambos tipos de cobro) antes de considerarse atrasado. */
  diasGracia: number;
  color: string;
  activa: boolean;
}

export interface Grupo {
  id: string;
  academiaId: string;
  nombre: string;
  orden: number;
}

export interface Plan {
  id: string;
  academiaId: string;
  nombre: string;
  costo: number;
  numeroClases: number;
  activo: boolean;
}

export interface Alumno {
  id: string;
  nombre: string;
  academiaId: string;
  grupoId: string;
  planId: string;
  /** Fecha ISO (YYYY-MM-DD). Define el día de vencimiento cuando la academia cobra por aniversario. */
  fechaInscripcion: string;
  telefono: string;
  tutor: string;
  /** true = alumno dado de baja, se excluye de cobros y reportes de actividad. */
  baja: boolean;
}

export type EstadoPago = "pagado" | "pendiente" | "atrasado";

export interface Pago {
  id: string;
  alumnoId: string;
  /** "YYYY-MM": mes al que corresponde la mensualidad. */
  periodo: string;
  fechaVencimiento: string;
  fechaLimiteSinRecargo: string;
  fechaPago: string | null;
  monto: number;
  metodoPago: string | null;
}

export interface Asistencia {
  id: string;
  alumnoId: string;
  grupoId: string;
  fecha: string;
  presente: boolean;
  /** "YYYY-MM": periodo de plan al que cuenta esta clase. */
  periodo: string;
}

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  passwordHash: string;
}

export interface Store {
  academias: Academia[];
  grupos: Grupo[];
  planes: Plan[];
  alumnos: Alumno[];
  pagos: Pago[];
  asistencias: Asistencia[];
  usuarios: Usuario[];
}
