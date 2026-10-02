"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast-provider";
import type { Academia, Plan } from "@/lib/types";

type ResultadoAccion = { ok: true } | { ok: false; error: string };

interface PlanFormProps {
  academias: Academia[];
  plan?: Plan;
  accion: (estadoPrevio: ResultadoAccion | null, formData: FormData) => Promise<ResultadoAccion>;
  etiquetaBoton: string;
  destinoExito: string;
  mensajeExito: string;
}

export function PlanForm({ academias, plan, accion, etiquetaBoton, destinoExito, mensajeExito }: PlanFormProps) {
  const esEdicion = Boolean(plan);
  const router = useRouter();
  const { notify } = useToast();
  const [estado, formAction, pendiente] = useActionState(accion, null);
  const [academiaId, setAcademiaId] = useState(plan?.academiaId ?? academias[0]?.id ?? "");
  const [confirmando, setConfirmando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Sincroniza con el resultado del Server Action (sistema externo), no con props/estado local.
    if (estado?.ok) {
      notify(mensajeExito, "success");
      router.push(destinoExito);
    } else if (estado && !estado.ok) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfirmando(false);
    }
  }, [estado, notify, mensajeExito, router, destinoExito]);

  function manejarSubmit(evento: React.FormEvent<HTMLFormElement>) {
    if (esEdicion) {
      evento.preventDefault();
      setConfirmando(true);
    }
  }

  function confirmarGuardado() {
    if (!formRef.current) return;
    const datos = new FormData(formRef.current);
    startTransition(() => formAction(datos));
  }

  return (
    <>
      <Box component="form" ref={formRef} action={formAction} onSubmit={manejarSubmit}>
        <Stack spacing={2} sx={{ maxWidth: 420 }}>
          {estado && !estado.ok && <Alert severity="error">{estado.error}</Alert>}

          <TextField
            select
            name="academiaId"
            label="Academia"
            value={academiaId}
            onChange={(e) => setAcademiaId(e.target.value)}
            required
            fullWidth
            helperText={academias.length === 0 ? "Primero crea una academia." : undefined}
          >
            {academias.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField name="nombre" label="Nombre del plan" defaultValue={plan?.nombre} required fullWidth />

          <TextField
            name="costo"
            type="number"
            label="Costo mensual (MXN)"
            defaultValue={plan?.costo}
            required
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: 50 } }}
          />

          <TextField
            name="numeroClases"
            type="number"
            label="Clases incluidas al mes"
            defaultValue={plan?.numeroClases}
            required
            fullWidth
            slotProps={{ htmlInput: { min: 1 } }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={pendiente}
            startIcon={pendiente ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {pendiente ? "Guardando..." : etiquetaBoton}
          </Button>
        </Stack>
      </Box>

      {esEdicion && (
        <ConfirmDialog
          open={confirmando}
          titulo="Guardar cambios"
          descripcion="¿Confirmas que quieres guardar los cambios de este plan?"
          etiquetaConfirmar="Guardar"
          pendiente={pendiente}
          onConfirmar={confirmarGuardado}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </>
  );
}
