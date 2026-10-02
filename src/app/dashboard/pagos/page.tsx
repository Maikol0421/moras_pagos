import { Suspense } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AcademiaBadge } from "@/components/academia-badge";
import { MarcarPagoDialog } from "@/components/marcar-pago-dialog";
import { PagoStatusChip } from "@/components/pago-status-chip";
import { PagosFiltros } from "@/components/pagos-filtros";
import { RevertirPagoButton } from "@/components/revertir-pago-button";
import {
  calcularEstadoPago,
  formatearMoneda,
  nombrePeriodo,
  periodoActual,
  ultimosPeriodos,
} from "@/lib/reglas-negocio";
import { obtenerStore } from "@/lib/store";
import type { EstadoPago } from "@/lib/types";

const ORDEN_ESTADO: Record<EstadoPago, number> = { atrasado: 0, pendiente: 1, pagado: 2 };

export default async function PagosPage(props: PageProps<"/dashboard/pagos">) {
  const searchParams = await props.searchParams;
  const periodos = ultimosPeriodos(6);
  const periodo = typeof searchParams.periodo === "string" ? searchParams.periodo : periodoActual();
  const academiaId = typeof searchParams.academiaId === "string" ? searchParams.academiaId : "";
  const estadoFiltro = typeof searchParams.estado === "string" ? (searchParams.estado as EstadoPago) : "";

  const store = obtenerStore();

  const filas = store.pagos
    .filter((pago) => pago.periodo === periodo)
    .map((pago) => {
      const alumno = store.alumnos.find((a) => a.id === pago.alumnoId)!;
      const academia = store.academias.find((a) => a.id === alumno.academiaId)!;
      return { pago, alumno, academia, estado: calcularEstadoPago(pago) };
    })
    .filter((fila) => !academiaId || fila.academia.id === academiaId)
    .filter((fila) => !estadoFiltro || fila.estado === estadoFiltro)
    .sort((a, b) => ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado] || a.alumno.nombre.localeCompare(b.alumno.nombre, "es"));

  const resumen = { pagado: 0, pendiente: 0, atrasado: 0 };
  for (const fila of filas) resumen[fila.estado] += 1;

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5">Pagos</Typography>
        <Typography variant="body2" color="text.secondary">
          {nombrePeriodo(periodo)}
        </Typography>
      </Stack>

      <Suspense>
        <PagosFiltros academias={store.academias} periodos={periodos} />
      </Suspense>

      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Typography variant="body2">
          <strong>{resumen.pagado}</strong> pagados
        </Typography>
        <Typography variant="body2" color="warning.main">
          <strong>{resumen.pendiente}</strong> pendientes
        </Typography>
        <Typography variant="body2" color="error.main">
          <strong>{resumen.atrasado}</strong> atrasados
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          gap: 1.5,
          alignItems: "start",
        }}
      >
        {filas.map(({ pago, alumno, academia, estado }) => (
          <Card key={pago.id}>
            <CardContent sx={{ "&:last-child": { pb: 2 } }}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {alumno.nombre}
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                    <AcademiaBadge academia={academia} />
                    <Typography variant="caption" color="text.secondary">
                      Vence {pago.fechaVencimiento}
                      {pago.fechaPago ? ` · Pagado ${pago.fechaPago} (${pago.metodoPago})` : ""}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack spacing={0.75} sx={{ alignItems: "flex-end" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {formatearMoneda(pago.monto)}
                  </Typography>
                  <PagoStatusChip estado={estado} />
                </Stack>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "flex-end", mt: 1.5 }}>
                {pago.fechaPago ? (
                  <RevertirPagoButton pagoId={pago.id} nombreAlumno={alumno.nombre} />
                ) : (
                  <MarcarPagoDialog pagoId={pago.id} nombreAlumno={alumno.nombre} montoTexto={formatearMoneda(pago.monto)} />
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
        {filas.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center", gridColumn: "1/-1" }}>
            No hay pagos con esos filtros.
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
