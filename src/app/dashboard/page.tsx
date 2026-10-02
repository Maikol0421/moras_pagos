import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { AcademiaBadge } from "@/components/academia-badge";
import { ActivosChart } from "@/components/charts/activos-chart";
import { IngresosChart } from "@/components/charts/ingresos-chart";
import { KpiCard } from "@/components/kpi-card";
import { etiquetaCorta, formatearMoneda, nombrePeriodo, periodoActual } from "@/lib/reglas-negocio";
import { resumenGeneral, resumenPorAcademia, serieIngresos } from "@/lib/reportes";

export default function ResumenPage() {
  const periodo = periodoActual();
  const general = resumenGeneral(periodo);
  const porAcademia = resumenPorAcademia(periodo);
  const ingresos = serieIngresos(6);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5">Resumen</Typography>
        <Typography variant="body2" color="text.secondary">
          {nombrePeriodo(periodo)}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            etiqueta="Ingresos del mes"
            valor={formatearMoneda(general.ingresos)}
            ayuda="Cobrado a la fecha"
            Icono={PaymentsRoundedIcon}
            color="#2a78d6"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            etiqueta="Alumnos activos"
            valor={String(general.activos)}
            ayuda="Con plan pagado este mes"
            Icono={GroupRoundedIcon}
            color="#0ca30c"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            etiqueta="Alumnos inactivos"
            valor={String(general.inactivos)}
            ayuda="Sin pago registrado este mes"
            Icono={PersonOffRoundedIcon}
            color="#898781"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            etiqueta="Academias"
            valor={String(porAcademia.length)}
            ayuda="Registradas en el sistema"
            Icono={SchoolRoundedIcon}
            color="#DB2777"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Ingresos · últimos 6 meses
              </Typography>
              <IngresosChart datos={ingresos} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Alumnos por academia
              </Typography>
              <ActivosChart
                datos={porAcademia.map((r) => ({
                  nombre: etiquetaCorta(r.academia.nombre),
                  activos: r.activos,
                  inactivos: r.inactivos,
                }))}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Detalle por academia
          </Typography>
          <Stack spacing={0}>
            {porAcademia.map(({ academia, activos, inactivos }) => (
              <Stack
                key={academia.id}
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <AcademiaBadge academia={academia} />
                <Stack direction="row" spacing={3}>
                  <Typography variant="body2">
                    <strong>{activos}</strong> activos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{inactivos}</strong> inactivos
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
