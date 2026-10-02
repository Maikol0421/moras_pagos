import { notFound } from "next/navigation";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AlumnoForm } from "@/components/alumno-form";
import { actualizarAlumnoAction } from "@/lib/actions-alumnos";
import { obtenerStore } from "@/lib/store";

export default async function EditarAlumnoPage(props: PageProps<"/dashboard/alumnos/[id]/editar">) {
  const { id } = await props.params;
  const store = obtenerStore();
  const alumno = store.alumnos.find((a) => a.id === id);
  if (!alumno) notFound();

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Editar alumno</Typography>
      <AlumnoForm
        academias={store.academias}
        grupos={store.grupos}
        planes={store.planes}
        alumno={alumno}
        accion={actualizarAlumnoAction.bind(null, alumno.id)}
        etiquetaBoton="Guardar cambios"
        destinoExito={`/dashboard/alumnos/${alumno.id}`}
        mensajeExito="Cambios guardados."
      />
    </Stack>
  );
}
