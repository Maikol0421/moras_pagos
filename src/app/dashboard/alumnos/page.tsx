import { Suspense } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AlumnoCard } from "@/components/alumno-card";
import { AlumnosFiltros } from "@/components/alumnos-filtros";
import { LinkButton } from "@/components/link-button";
import { calcularEstadoPago, clasesRestantes, periodoActual } from "@/lib/reglas-negocio";
import { obtenerStore } from "@/lib/store";

export default async function AlumnosPage(props: PageProps<"/dashboard/alumnos">) {
  const searchParams = await props.searchParams;
  const academiaId = typeof searchParams.academiaId === "string" ? searchParams.academiaId : "";
  const grupoId = typeof searchParams.grupoId === "string" ? searchParams.grupoId : "";
  const estado = typeof searchParams.estado === "string" ? searchParams.estado : "";

  const store = obtenerStore();
  const periodo = periodoActual();

  let alumnos = store.alumnos;
  if (academiaId) alumnos = alumnos.filter((a) => a.academiaId === academiaId);
  if (grupoId) alumnos = alumnos.filter((a) => a.grupoId === grupoId);

  const filas = alumnos
    .map((alumno) => {
      const pago = store.pagos.find((p) => p.alumnoId === alumno.id && p.periodo === periodo);
      const estadoPago = pago ? calcularEstadoPago(pago) : null;
      const plan = store.planes.find((p) => p.id === alumno.planId)!;
      const academia = store.academias.find((a) => a.id === alumno.academiaId)!;
      const grupo = store.grupos.find((g) => g.id === alumno.grupoId)!;
      const restantes = clasesRestantes(plan, store.asistencias, alumno.id, periodo);
      const estadoCalculado = alumno.baja ? "baja" : estadoPago === "pagado" ? "activo" : "inactivo";
      return { alumno, academia, grupo, plan, estadoPago, restantes, estadoCalculado };
    })
    .filter((fila) => !estado || fila.estadoCalculado === estado)
    .sort((a, b) => a.alumno.nombre.localeCompare(b.alumno.nombre, "es"));

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="h5">Alumnos</Typography>
        <LinkButton href="/dashboard/alumnos/nuevo" variant="contained" startIcon={<AddRoundedIcon />}>
          Nuevo alumno
        </LinkButton>
      </Stack>

      <Suspense>
        <AlumnosFiltros academias={store.academias} grupos={store.grupos} />
      </Suspense>

      <Typography variant="body2" color="text.secondary">
        {filas.length} alumno(s)
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          gap: 1.5,
          alignItems: "start",
        }}
      >
        {filas.map(({ alumno, academia, grupo, plan, estadoPago, restantes }) => (
          <AlumnoCard
            key={alumno.id}
            alumno={alumno}
            academia={academia}
            grupo={grupo}
            plan={plan}
            estadoPago={estadoPago}
            clasesRestantes={restantes}
          />
        ))}
        {filas.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center", gridColumn: "1/-1" }}>
            No hay alumnos con esos filtros.
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
