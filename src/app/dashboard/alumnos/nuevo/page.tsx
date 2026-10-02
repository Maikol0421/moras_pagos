import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AlumnoForm } from "@/components/alumno-form";
import { crearAlumnoAction } from "@/lib/actions-alumnos";
import { obtenerStore } from "@/lib/store";

export default function NuevoAlumnoPage() {
  const store = obtenerStore();

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5">Nuevo alumno</Typography>
        <Typography variant="body2" color="text.secondary">
          Se generará automáticamente su pago del periodo actual.
        </Typography>
      </Stack>
      <AlumnoForm
        academias={store.academias}
        grupos={store.grupos}
        planes={store.planes}
        accion={crearAlumnoAction}
        etiquetaBoton="Crear alumno"
        destinoExito="/dashboard/alumnos"
        mensajeExito="Alumno creado."
      />
    </Stack>
  );
}
