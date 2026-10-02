"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Box from "@mui/material/Box";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CircularProgress from "@mui/material/CircularProgress";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useToast } from "./toast-provider";
import { renombrarGrupoAction } from "@/lib/actions-config";
import type { Grupo } from "@/lib/types";

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <IconButton type="submit" size="small" color="primary" disabled={pending}>
      {pending ? <CircularProgress size={18} color="inherit" /> : <CheckRoundedIcon fontSize="small" />}
    </IconButton>
  );
}

export function GrupoItem({ grupo }: { grupo: Grupo }) {
  const [editando, setEditando] = useState(false);
  const [estado, formAction] = useActionState(renombrarGrupoAction.bind(null, grupo.id), null);
  const { notify } = useToast();

  useEffect(() => {
    // Sincroniza con el resultado del Server Action (sistema externo), no con props/estado local.
    if (estado?.ok) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditando(false);
      notify("Grupo renombrado.", "success");
    }
  }, [estado, notify]);

  if (!editando) {
    return (
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
        <Typography variant="body2">{grupo.nombre}</Typography>
        <IconButton size="small" onClick={() => setEditando(true)}>
          <EditRoundedIcon fontSize="inherit" />
        </IconButton>
      </Stack>
    );
  }

  return (
    <Box component="form" action={formAction} sx={{ py: 0.5 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <TextField name="nombre" size="small" defaultValue={grupo.nombre} autoFocus fullWidth />
        <BotonGuardar />
        <IconButton size="small" onClick={() => setEditando(false)}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
      {estado && !estado.ok && (
        <Typography variant="caption" color="error">
          {estado.error}
        </Typography>
      )}
    </Box>
  );
}
