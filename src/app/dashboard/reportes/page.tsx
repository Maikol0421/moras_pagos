import { Suspense } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { ActivosChart } from "@/components/charts/activos-chart";
import { IngresosChart } from "@/components/charts/ingresos-chart";
import { KpiCard } from "@/components/kpi-card";
import { ReportesFiltros } from "@/components/reportes-filtros";
import { etiquetaCorta, formatearMoneda, nombrePeriodo, periodoActual, ultimosPeriodos } from "@/lib/reglas-negocio";
import { resumenGeneral, resumenPorAcademia, resumenPorGrupo, serieIngresos } from "@/lib/reportes";
import { obtenerStore } from "@/lib/store";

export default async function ReportesPage(props: PageProps<"/dashboard/reportes">) {
  const searchParams = await props.searchParams;
  const periodos = ultimosPeriodos(6);
  const periodo = typeof searchParams.periodo === "string" ? searchParams.periodo : periodoActual();
  const academiaId = typeof searchParams.academiaId === "string" ? searchParams.academiaId : "";

  const store = obtenerStore();
  const general = resumenGeneral(periodo);
  const porAcademia = resumenPorAcademia(periodo);
  const porGrupo = resumenPorGrupo(academiaId || null, periodo);
  const ingresos = serieIngresos(6);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5">Reportes</Typography>
        <Typography variant="body2" color="text.secondary">
          {nombrePeriodo(periodo)}
        </Typography>
      </Stack>

      <Suspense>
        <ReportesFiltros academias={store.academias} periodos={periodos} />
      </Suspense>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard etiqueta="Ingresos del periodo" valor={formatearMoneda(general.ingresos)} color="#2a78d6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard etiqueta="Alumnos activos" valor={String(general.activos)} ayuda="Con plan pagado" color="#0ca30c" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard etiqueta="Alumnos inactivos" valor={String(general.inactivos)} ayuda="Sin pago registrado" color="#898781" />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Ingresos · últimos 6 meses
          </Typography>
          <IngresosChart datos={ingresos} />
        </CardContent>
      </Card>

      <Card>
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

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Alumnos por grupo / nivel
          </Typography>
          <ActivosChart
            datos={porGrupo.map((r) => ({
              nombre: etiquetaCorta(r.grupo.nombre),
              activos: r.activos,
              inactivos: r.inactivos,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Detalle numérico por academia
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Academia</TableCell>
                  <TableCell align="right">Activos</TableCell>
                  <TableCell align="right">Inactivos</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {porAcademia.map((r) => (
                  <TableRow key={r.academia.id}>
                    <TableCell>{r.academia.nombre}</TableCell>
                    <TableCell align="right">{r.activos}</TableCell>
                    <TableCell align="right">{r.inactivos}</TableCell>
                    <TableCell align="right">{r.activos + r.inactivos}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Stack>
  );
}
