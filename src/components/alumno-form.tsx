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
import { formatearMoneda, hoyISO } from "@/lib/reglas-negocio";
import type { Academia, Alumno, Grupo, Plan } from "@/lib/types";

type ResultadoAccion = { ok: true } | { ok: false; error: string };

interface AlumnoFormProps {
  academias: Academia[];
  grupos: Grupo[];
  planes: Plan[];
  alumno?: Alumno;
  accion: (estadoPrevio: ResultadoAccion | null, formData: FormData) => Promise<ResultadoAccion>;
  etiquetaBoton: string;
  destinoExito: string;
  mensajeExito: string;
}

export function AlumnoForm({
  academias,
  grupos,
  planes,
  alumno,
  accion,
  etiquetaBoton,
  destinoExito,
  mensajeExito,
}: AlumnoFormProps) {
  const esEdicion = Boolean(alumno);
  const router = useRouter();
  const { notify } = useToast();
  const [estado, formAction, pendiente] = useActionState(accion, null);
  const [academiaId, setAcademiaId] = useState(alumno?.academiaId ?? academias[0]?.id ?? "");
  const [grupoId, setGrupoId] = useState(alumno?.grupoId ?? "");
  const [planId, setPlanId] = useState(alumno?.planId ?? "");
  const [confirmando, setConfirmando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const gruposAcademia = grupos.filter((g) => g.academiaId === academiaId);
  const planesAcademia = planes.filter((p) => p.academiaId === academiaId);

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

  function cambiarAcademia(valor: string) {
    setAcademiaId(valor);
    setGrupoId("");
    setPlanId("");
  }

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
        <Stack spacing={2} sx={{ maxWidth: 480 }}>
          {estado && !estado.ok && <Alert severity="error">{estado.error}</Alert>}

          <TextField name="nombre" label="Nombre completo" defaultValue={alumno?.nombre} required fullWidth />

          <TextField
            select
            name="academiaId"
            label="Academia"
            value={academiaId}
            onChange={(e) => cambiarAcademia(e.target.value)}
            required
            fullWidth
            helperText={academias.length === 0 ? "Primero crea una academia en Academias." : undefined}
          >
            {academias.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            name="grupoId"
            label="Grupo / nivel"
            value={grupoId}
            onChange={(e) => setGrupoId(e.target.value)}
            required
            fullWidth
            disabled={gruposAcademia.length === 0}
            helperText={gruposAcademia.length === 0 ? "Esta academia todavía no tiene grupos." : undefined}
          >
            {gruposAcademia.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            name="planId"
            label="Plan"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            required
            fullWidth
            disabled={planesAcademia.length === 0}
            helperText={planesAcademia.length === 0 ? "Esta academia todavía no tiene planes." : undefined}
          >
            {planesAcademia.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombre} · {formatearMoneda(p.costo)} · {p.numeroClases} clases
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name="fechaInscripcion"
            type="date"
            label="Fecha de inscripción"
            defaultValue={alumno?.fechaInscripcion ?? hoyISO()}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Para academias que cobran por aniversario, este día define su fecha de pago cada mes."
          />

          <TextField
            name="telefono"
            label="Teléfono (10 dígitos)"
            defaultValue={alumno?.telefono}
            required
            fullWidth
            slotProps={{ htmlInput: { maxLength: 10, inputMode: "numeric" } }}
          />

          <TextField name="tutor" label="Tutor / contacto" defaultValue={alumno?.tutor} required fullWidth />

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
          descripcion="¿Confirmas que quieres guardar los cambios de este alumno?"
          etiquetaConfirmar="Guardar"
          pendiente={pendiente}
          onConfirmar={confirmarGuardado}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </>
  );
}
