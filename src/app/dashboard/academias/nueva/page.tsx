import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AcademiaForm } from "@/components/academia-form";
import { crearAcademiaAction } from "@/lib/actions-config";

export default function NuevaAcademiaPage() {
  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5">Nueva academia</Typography>
        <Typography variant="body2" color="text.secondary">
          Después podrás agregarle grupos/niveles y planes propios.
        </Typography>
      </Stack>
      <AcademiaForm
        accion={crearAcademiaAction}
        etiquetaBoton="Crear academia"
        destinoExito="/dashboard/academias"
        mensajeExito="Academia creada."
      />
    </Stack>
  );
}
