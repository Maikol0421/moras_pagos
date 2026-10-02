import bcrypt from "bcryptjs";
import {
  calcularFechaLimiteSinRecargo,
  calcularVencimiento,
  formatearFecha,
  periodoActual,
  sumarDias,
  ultimosPeriodos,
} from "./reglas-negocio";
import type { Alumno, Asistencia, Academia, Grupo, Pago, Plan, Store, Usuario } from "./types";

/** PRNG determinista (mulberry32) para que la demo luzca igual en cada arranque del servidor. */
function crearRng(semilla: number) {
  let estado = semilla;
  return function siguiente(): number {
    estado |= 0;
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOMBRES_PILA = [
  "Sofía", "Mateo", "Valentina", "Santiago", "Regina", "Emiliano", "Ximena", "Diego",
  "Camila", "Leonardo", "Renata", "Daniel", "Fernanda", "Sebastián", "Isabella", "Alejandro",
  "Paulina", "Rodrigo", "Daniela", "Gael", "Mariana", "Joaquín", "Victoria", "Emilio",
  "Andrea", "Nicolás", "Valeria", "Álvaro", "Luciana", "Patricio",
];

const APELLIDOS = [
  "García", "Martínez", "Hernández", "López", "González", "Pérez", "Sánchez", "Ramírez",
  "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Reyes", "Morales", "Cruz",
  "Ortiz", "Guerrero", "Mendoza", "Castillo",
];

const METODOS_PAGO = ["Efectivo", "Transferencia", "Tarjeta"];

export function generarDatosSemilla(): Store {
  const rng = crearRng(20260101);
  const aleatorio = (max: number) => Math.floor(rng() * max);
  const elegir = <T,>(lista: T[]): T => lista[aleatorio(lista.length)];

  let contadorId = 0;
  const id = (prefijo: string) => {
    contadorId += 1;
    return `${prefijo}-${contadorId}`;
  };

  const academias: Academia[] = [
    {
      id: "academia-musica",
      nombre: "Academia de Música",
      tipoCobro: "calendario",
      diaCorte: 5,
      diasGracia: 2,
      color: "#2563EB",
      activa: true,
    },
    {
      id: "academia-danza",
      nombre: "Academia de Danza (Ballet)",
      tipoCobro: "aniversario",
      diaCorte: 1,
      diasGracia: 3,
      color: "#DB2777",
      activa: true,
    },
  ];

  const grupos: Grupo[] = [
    { id: "grupo-piano", academiaId: "academia-musica", nombre: "Piano", orden: 1 },
    { id: "grupo-guitarra", academiaId: "academia-musica", nombre: "Guitarra", orden: 2 },
    { id: "grupo-canto", academiaId: "academia-musica", nombre: "Canto", orden: 3 },
    { id: "grupo-bateria", academiaId: "academia-musica", nombre: "Batería", orden: 4 },
    { id: "grupo-nivel-1", academiaId: "academia-danza", nombre: "Nivel 1 · Principiantes", orden: 1 },
    { id: "grupo-nivel-2", academiaId: "academia-danza", nombre: "Nivel 2 · Intermedio", orden: 2 },
    { id: "grupo-nivel-3", academiaId: "academia-danza", nombre: "Nivel 3 · Avanzado", orden: 3 },
  ];

  const planes: Plan[] = [
    { id: "plan-musica-basico", academiaId: "academia-musica", nombre: "Básico", costo: 800, numeroClases: 4, activo: true },
    { id: "plan-musica-regular", academiaId: "academia-musica", nombre: "Regular", costo: 1400, numeroClases: 8, activo: true },
    { id: "plan-musica-intensivo", academiaId: "academia-musica", nombre: "Intensivo", costo: 1900, numeroClases: 12, activo: true },
    { id: "plan-danza-basico", academiaId: "academia-danza", nombre: "Básico", costo: 900, numeroClases: 8, activo: true },
    { id: "plan-danza-regular", academiaId: "academia-danza", nombre: "Regular", costo: 1300, numeroClases: 12, activo: true },
    { id: "plan-danza-intensivo", academiaId: "academia-danza", nombre: "Intensivo", costo: 1700, numeroClases: 16, activo: true },
  ];

  function fechaAleatoriaPasada(mesesAtras: number): string {
    const hoy = new Date();
    const mesesOffset = aleatorio(mesesAtras);
    const dia = 1 + aleatorio(28);
    return formatearFecha(new Date(hoy.getFullYear(), hoy.getMonth() - mesesOffset, dia));
  }

  function generarTelefono(): string {
    let numero = "55";
    for (let i = 0; i < 8; i += 1) numero += aleatorio(10);
    return numero;
  }

  const alumnos: Alumno[] = [];
  for (const grupo of grupos) {
    const planesAcademia = planes.filter((p) => p.academiaId === grupo.academiaId);
    const cantidad = 5 + aleatorio(5);
    for (let i = 0; i < cantidad; i += 1) {
      alumnos.push({
        id: id("alumno"),
        nombre: `${elegir(NOMBRES_PILA)} ${elegir(APELLIDOS)} ${elegir(APELLIDOS)}`,
        academiaId: grupo.academiaId,
        grupoId: grupo.id,
        planId: elegir(planesAcademia).id,
        fechaInscripcion: fechaAleatoriaPasada(14),
        telefono: generarTelefono(),
        tutor: `${elegir(NOMBRES_PILA)} ${elegir(APELLIDOS)}`,
        baja: rng() < 0.06,
      });
    }
  }

  const periodoHoy = periodoActual();
  const periodosHistoricos = ultimosPeriodos(6);
  const pagos: Pago[] = [];
  for (const alumno of alumnos) {
    const academia = academias.find((a) => a.id === alumno.academiaId)!;
    const plan = planes.find((p) => p.id === alumno.planId)!;
    const periodoInscripcion = alumno.fechaInscripcion.slice(0, 7);

    for (const periodo of periodosHistoricos) {
      if (periodo < periodoInscripcion) continue;

      const vencimiento = calcularVencimiento(academia, alumno, periodo);
      const fechaLimiteSinRecargo = calcularFechaLimiteSinRecargo(academia, vencimiento);
      const esPeriodoActual = periodo === periodoHoy;

      let fechaPago: string | null = null;
      const r = rng();
      if (esPeriodoActual) {
        if (r < 0.5) fechaPago = sumarDias(vencimiento, -aleatorio(4));
        // 30% pendiente, 20% atrasado -> fechaPago queda null; el estado se deriva con la fecha de hoy
      } else if (r < 0.8) {
        fechaPago = sumarDias(vencimiento, aleatorio(5) - 2);
      } else if (r < 0.93) {
        fechaPago = sumarDias(fechaLimiteSinRecargo, 1 + aleatorio(5));
      }

      pagos.push({
        id: id("pago"),
        alumnoId: alumno.id,
        periodo,
        fechaVencimiento: vencimiento,
        fechaLimiteSinRecargo,
        fechaPago,
        monto: plan.costo,
        metodoPago: fechaPago ? elegir(METODOS_PAGO) : null,
      });
    }
  }

  const asistencias: Asistencia[] = [];
  const hoy = new Date();
  for (const alumno of alumnos) {
    if (alumno.baja) continue;
    const plan = planes.find((p) => p.id === alumno.planId)!;
    const diasTranscurridos = Math.max(hoy.getDate(), 1);
    const tomadasMax = Math.min(plan.numeroClases, diasTranscurridos);
    const tomadas = aleatorio(tomadasMax + 1);
    const diasUsados = new Set<number>();
    for (let i = 0; i < tomadas; i += 1) {
      let dia = 1 + aleatorio(diasTranscurridos);
      while (diasUsados.has(dia)) dia = 1 + aleatorio(diasTranscurridos);
      diasUsados.add(dia);
      asistencias.push({
        id: id("asistencia"),
        alumnoId: alumno.id,
        grupoId: alumno.grupoId,
        fecha: formatearFecha(new Date(hoy.getFullYear(), hoy.getMonth(), dia)),
        presente: rng() < 0.9,
        periodo: periodoHoy,
      });
    }
  }

  const usuarios: Usuario[] = [
    {
      id: "usuario-admin",
      email: "admin@academia.com",
      nombre: "Administrador",
      passwordHash: bcrypt.hashSync("Demo1234", 10),
    },
  ];

  return { academias, grupos, planes, alumnos, pagos, asistencias, usuarios };
}
