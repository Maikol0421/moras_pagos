import "server-only";
import { alumnoEstaActivo, ingresosDelPeriodo, periodoActual, ultimosPeriodos } from "./reglas-negocio";
import { obtenerStore } from "./store";
import type { Academia, Grupo } from "./types";

export interface ConteoActividad {
  activos: number;
  inactivos: number;
}

function conteoPorAlumnos(alumnoIds: Set<string>, periodo: string): ConteoActividad {
  const store = obtenerStore();
  let activos = 0;
  let inactivos = 0;
  for (const alumno of store.alumnos) {
    if (alumno.baja || !alumnoIds.has(alumno.id)) continue;
    if (alumnoEstaActivo(alumno, store.pagos, periodo)) activos += 1;
    else inactivos += 1;
  }
  return { activos, inactivos };
}

export function resumenGeneral(periodo: string = periodoActual()) {
  const store = obtenerStore();
  const ids = new Set(store.alumnos.map((a) => a.id));
  return { ...conteoPorAlumnos(ids, periodo), ingresos: ingresosDelPeriodo(store.pagos, periodo) };
}

export function resumenPorAcademia(
  periodo: string = periodoActual(),
): Array<ConteoActividad & { academia: Academia }> {
  const store = obtenerStore();
  return store.academias.map((academia) => {
    const ids = new Set(store.alumnos.filter((a) => a.academiaId === academia.id).map((a) => a.id));
    return { academia, ...conteoPorAlumnos(ids, periodo) };
  });
}

export function resumenPorGrupo(
  academiaId: string | null = null,
  periodo: string = periodoActual(),
): Array<ConteoActividad & { grupo: Grupo }> {
  const store = obtenerStore();
  const grupos = academiaId ? store.grupos.filter((g) => g.academiaId === academiaId) : store.grupos;
  return grupos
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .map((grupo) => {
      const ids = new Set(store.alumnos.filter((a) => a.grupoId === grupo.id).map((a) => a.id));
      return { grupo, ...conteoPorAlumnos(ids, periodo) };
    });
}

export function serieIngresos(cantidadMeses: number): Array<{ periodo: string; monto: number }> {
  const store = obtenerStore();
  return ultimosPeriodos(cantidadMeses).map((periodo) => ({
    periodo,
    monto: ingresosDelPeriodo(store.pagos, periodo),
  }));
}
