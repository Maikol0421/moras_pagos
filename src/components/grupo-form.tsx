"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useToast } from "./toast-provider";
import { crearGrupoAction } from "@/lib/actions-config";

function BotonAgregar() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="small"
      variant="outlined"
      disabled={pending}
      startIcon={pending ? <CircularProgress size={14} color="inherit" /> : undefined}
    >
      {pending ? "Agregando..." : "Agregar"}
    </Button>
  );
}

export function GrupoForm({ academiaId }: { academiaId: string }) {
  const [estado, formAction] = useActionState(crearGrupoAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const { notify } = useToast();

  useEffect(() => {
    if (estado?.ok) {
      formRef.current?.reset();
      notify("Grupo agregado.", "success");
    }
  }, [estado, notify]);

  return (
    <Box component="form" ref={formRef} action={formAction}>
      <input type="hidden" name="academiaId" value={academiaId} />
      <Stack direction="row" spacing={1}>
        <TextField name="nombre" size="small" placeholder="Nuevo grupo o nivel" fullWidth />
        <BotonAgregar />
      </Stack>
      {estado && !estado.ok && (
        <Typography variant="caption" color="error">
          {estado.error}
        </Typography>
      )}
    </Box>
  );
}
