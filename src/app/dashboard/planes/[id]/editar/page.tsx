import { notFound } from "next/navigation";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PlanForm } from "@/components/plan-form";
import { actualizarPlanAction } from "@/lib/actions-config";
import { obtenerStore } from "@/lib/store";

export default async function EditarPlanPage(props: PageProps<"/dashboard/planes/[id]/editar">) {
  const { id } = await props.params;
  const store = obtenerStore();
  const plan = store.planes.find((p) => p.id === id);
  if (!plan) notFound();

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Editar plan</Typography>
      <PlanForm
        academias={store.academias}
        plan={plan}
        accion={actualizarPlanAction.bind(null, plan.id)}
        etiquetaBoton="Guardar cambios"
        destinoExito="/dashboard/planes"
        mensajeExito="Cambios guardados."
      />
    </Stack>
  );
}
