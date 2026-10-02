import { notFound } from "next/navigation";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AcademiaForm } from "@/components/academia-form";
import { actualizarAcademiaAction } from "@/lib/actions-config";
import { obtenerStore } from "@/lib/store";

export default async function EditarAcademiaPage(props: PageProps<"/dashboard/academias/[id]/editar">) {
  const { id } = await props.params;
  const store = obtenerStore();
  const academia = store.academias.find((a) => a.id === id);
  if (!academia) notFound();

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Editar academia</Typography>
      <AcademiaForm
        academia={academia}
        accion={actualizarAcademiaAction.bind(null, academia.id)}
        etiquetaBoton="Guardar cambios"
        destinoExito="/dashboard/academias"
        mensajeExito="Cambios guardados."
      />
    </Stack>
  );
}
