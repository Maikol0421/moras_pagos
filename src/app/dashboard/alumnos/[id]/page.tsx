import { notFound } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { AcademiaBadge } from "@/components/academia-badge";
import { AlumnoBajaToggle } from "@/components/alumno-baja-toggle";
import { LinkButton } from "@/components/link-button";
import { PagoStatusChip } from "@/components/pago-status-chip";
import {
  calcularEstadoPago,
  clasesRestantes,
  formatearMoneda,
  nombrePeriodo,
  periodoActual,
} from "@/lib/reglas-negocio";
import { obtenerStore } from "@/lib/store";

export default async function AlumnoDetallePage(props: PageProps<"/dashboard/alumnos/[id]">) {
  const { id } = await props.params;
  const store = obtenerStore();
  const alumno = store.alumnos.find((a) => a.id === id);
  if (!alumno) notFound();

  const academia = store.academias.find((a) => a.id === alumno.academiaId)!;
  const grupo = store.grupos.find((g) => g.id === alumno.grupoId)!;
  const plan = store.planes.find((p) => p.id === alumno.planId)!;
  const periodo = periodoActual();
  const restantes = clasesRestantes(plan, store.asistencias, alumno.id, periodo);
  const tomadas = plan.numeroClases - restantes;

  const pagos = store.pagos
    .filter((p) => p.alumnoId === alumno.id)
    .sort((a, b) => b.periodo.localeCompare(a.periodo));

  const asistenciasPeriodo = store.asistencias
    .filter((a) => a.alumnoId === alumno.id && a.periodo === periodo)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const pagoActual = pagos.find((p) => p.periodo === periodo);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Typography variant="h5">{alumno.nombre}</Typography>
            {alumno.baja && <Chip size="small" label="Baja" />}
            {!alumno.baja && pagoActual && <PagoStatusChip estado={calcularEstadoPago(pagoActual)} />}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AcademiaBadge academia={academia} />
            <Typography variant="body2" color="text.secondary">
              {grupo.nombre}
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1}>
          <LinkButton href={`/dashboard/alumnos/${alumno.id}/editar`} startIcon={<EditRoundedIcon />} variant="outlined">
            Editar
          </LinkButton>
          <AlumnoBajaToggle alumnoId={alumno.id} nombreAlumno={alumno.nombre} baja={alumno.baja} />
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Contacto
              </Typography>
              <Stack spacing={0.5} sx={{ mt: 1 }}>
                <Typography variant="body2">Tel: {alumno.telefono}</Typography>
                <Typography variant="body2">Tutor: {alumno.tutor}</Typography>
                <Typography variant="body2">Inscripción: {alumno.fechaInscripcion}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Plan actual
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5 }}>
                {plan.nombre} · {formatearMoneda(plan.costo)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {nombrePeriodo(periodo)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Clases restantes
              </Typography>
              <Typography variant="h5" sx={{ mt: 0.5 }}>
                {restantes} / {plan.numeroClases}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((tomadas / plan.numeroClases) * 100, 100)}
                sx={{ mt: 1.5, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Historial de pagos
          </Typography>
          <Stack spacing={0}>
            {pagos.map((pago) => (
              <Stack
                key={pago.id}
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1.25,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <Stack>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {nombrePeriodo(pago.periodo)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vence {pago.fechaVencimiento}
                    {pago.fechaPago ? ` · Pagado ${pago.fechaPago}` : ""}
                    {pago.metodoPago ? ` · ${pago.metodoPago}` : ""}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Typography variant="body2">{formatearMoneda(pago.monto)}</Typography>
                  <PagoStatusChip estado={calcularEstadoPago(pago)} />
                </Stack>
              </Stack>
            ))}
            {pagos.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Sin pagos registrados todavía.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Asistencia · {nombrePeriodo(periodo)}
          </Typography>
          <Stack spacing={0}>
            {asistenciasPeriodo.map((a) => (
              <Stack
                key={a.id}
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  py: 1,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <Typography variant="body2">{a.fecha}</Typography>
                <Chip size="small" label={a.presente ? "Asistió" : "Faltó"} color={a.presente ? "success" : "default"} variant="outlined" />
              </Stack>
            ))}
            {asistenciasPeriodo.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Sin clases registradas en este periodo.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
