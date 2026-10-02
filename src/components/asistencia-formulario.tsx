"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useToast } from "./toast-provider";
import { guardarAsistenciaAction } from "@/lib/actions-asistencia";

interface AlumnoRoster {
  id: string;
  nombre: string;
  presenteInicial: boolean;
}

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="contained"
      disabled={pending}
      startIcon={pending ? <CircularProgress size={18} color="inherit" /> : undefined}
    >
      {pending ? "Guardando..." : "Guardar asistencia"}
    </Button>
  );
}

export function AsistenciaFormulario({
  grupoId,
  fecha,
  roster,
}: {
  grupoId: string;
  fecha: string;
  roster: AlumnoRoster[];
}) {
  const [estado, formAction] = useActionState(guardarAsistenciaAction, null);
  const { notify } = useToast();

  useEffect(() => {
    if (estado?.ok) notify("Asistencia guardada.", "success");
  }, [estado, notify]);

  if (roster.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Este grupo no tiene alumnos activos.
      </Typography>
    );
  }

  return (
    <Box component="form" action={formAction}>
      <input type="hidden" name="grupoId" value={grupoId} />
      <input type="hidden" name="fecha" value={fecha} />
      <input type="hidden" name="alumnoIds" value={JSON.stringify(roster.map((r) => r.id))} />

      {estado && !estado.ok && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {estado.error}
        </Alert>
      )}

      <Stack spacing={0}>
        {roster.map((alumno) => (
          <Stack
            key={`${alumno.id}-${alumno.presenteInicial}`}
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "center", py: 0.75, borderBottom: "1px solid", borderColor: "divider" }}
          >
            <Typography variant="body2">{alumno.nombre}</Typography>
            <Switch name={`presente-${alumno.id}`} defaultChecked={alumno.presenteInicial} />
          </Stack>
        ))}
      </Stack>

      <Box sx={{ pt: 2 }}>
        <BotonGuardar />
      </Box>
    </Box>
  );
}
