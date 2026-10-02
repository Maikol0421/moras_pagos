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
import type { Academia, TipoCobro } from "@/lib/types";

type ResultadoAccion = { ok: true } | { ok: false; error: string };

interface AcademiaFormProps {
  academia?: Academia;
  accion: (estadoPrevio: ResultadoAccion | null, formData: FormData) => Promise<ResultadoAccion>;
  etiquetaBoton: string;
  destinoExito: string;
  mensajeExito: string;
}

export function AcademiaForm({ academia, accion, etiquetaBoton, destinoExito, mensajeExito }: AcademiaFormProps) {
  const esEdicion = Boolean(academia);
  const router = useRouter();
  const { notify } = useToast();
  const [estado, formAction, pendiente] = useActionState(accion, null);
  const [tipoCobro, setTipoCobro] = useState<TipoCobro>(academia?.tipoCobro ?? "calendario");
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

          <TextField name="nombre" label="Nombre de la academia" defaultValue={academia?.nombre} required fullWidth />

          <TextField
            select
            name="tipoCobro"
            label="Tipo de cobro"
            value={tipoCobro}
            onChange={(e) => setTipoCobro(e.target.value as TipoCobro)}
            required
            fullWidth
            helperText={
              tipoCobro === "calendario"
                ? "Todos los alumnos pagan el mismo día del mes."
                : "Cada alumno paga el día del mes en que se inscribió."
            }
          >
            <MenuItem value="calendario">Calendario (mismo día para todos)</MenuItem>
            <MenuItem value="aniversario">Aniversario (día de inscripción)</MenuItem>
          </TextField>

          {tipoCobro === "calendario" ? (
            <TextField
              name="diaCorte"
              type="number"
              label="Día de vencimiento (1-28)"
              defaultValue={academia?.diaCorte ?? 5}
              required
              fullWidth
              slotProps={{ htmlInput: { min: 1, max: 28 } }}
            />
          ) : (
            <input type="hidden" name="diaCorte" value="1" />
          )}

          <TextField
            name="diasGracia"
            type="number"
            label="Días de gracia antes de recargo"
            defaultValue={academia?.diasGracia ?? 3}
            required
            fullWidth
            slotProps={{ htmlInput: { min: 0, max: 30 } }}
          />

          <TextField
            name="color"
            type="color"
            label="Color distintivo"
            defaultValue={academia?.color ?? "#4F46E5"}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { style: { height: 40, padding: 4, cursor: "pointer" } } }}
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
          descripcion="¿Confirmas que quieres guardar los cambios de esta academia?"
          etiquetaConfirmar="Guardar"
          pendiente={pendiente}
          onConfirmar={confirmarGuardado}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </>
  );
}
