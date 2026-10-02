import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PlanForm } from "@/components/plan-form";
import { crearPlanAction } from "@/lib/actions-config";
import { obtenerStore } from "@/lib/store";

export default function NuevoPlanPage() {
  const store = obtenerStore();

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Nuevo plan</Typography>
      <PlanForm
        academias={store.academias}
        accion={crearPlanAction}
        etiquetaBoton="Crear plan"
        destinoExito="/dashboard/planes"
        mensajeExito="Plan creado."
      />
    </Stack>
  );
}
