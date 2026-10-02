import { Suspense } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AsistenciaFormulario } from "@/components/asistencia-formulario";
import { AsistenciaSelector } from "@/components/asistencia-selector";
import { hoyISO } from "@/lib/reglas-negocio";
import { obtenerStore } from "@/lib/store";

export default async function AsistenciaPage(props: PageProps<"/dashboard/asistencia">) {
  const searchParams = await props.searchParams;
  const grupoId = typeof searchParams.grupoId === "string" ? searchParams.grupoId : "";
  const fecha = typeof searchParams.fecha === "string" ? searchParams.fecha : hoyISO();

  const store = obtenerStore();
  const grupo = store.grupos.find((g) => g.id === grupoId);

  const roster = grupo
    ? store.alumnos
        .filter((a) => a.grupoId === grupo.id && !a.baja)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
        .map((alumno) => {
          const registroExistente = store.asistencias.find(
            (asis) => asis.alumnoId === alumno.id && asis.fecha === fecha,
          );
          return {
            id: alumno.id,
            nombre: alumno.nombre,
            presenteInicial: registroExistente ? registroExistente.presente : true,
          };
        })
    : [];

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5">Asistencia</Typography>
        <Typography variant="body2" color="text.secondary">
          Selecciona academia, grupo y fecha para pasar lista.
        </Typography>
      </Stack>

      <Suspense>
        <AsistenciaSelector academias={store.academias} grupos={store.grupos} />
      </Suspense>

      {grupo ? (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              {grupo.nombre} · {fecha}
            </Typography>
            <AsistenciaFormulario key={`${grupo.id}-${fecha}`} grupoId={grupo.id} fecha={fecha} roster={roster} />
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
          Elige una academia y un grupo para comenzar.
        </Typography>
      )}
    </Stack>
  );
}
