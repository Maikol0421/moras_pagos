"use client";

import { useState, useTransition } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast-provider";
import { cambiarActivaAcademiaAction } from "@/lib/actions-config";

export function AcademiaActivaToggle({
  academiaId,
  nombreAcademia,
  activa,
}: {
  academiaId: string;
  nombreAcademia: string;
  activa: boolean;
}) {
  const [pendiente, startTransition] = useTransition();
  const [abierto, setAbierto] = useState(false);
  const { notify } = useToast();

  function ejecutar() {
    startTransition(async () => {
      const resultado = await cambiarActivaAcademiaAction(academiaId, !activa);
      setAbierto(false);
      if (resultado.ok) notify(activa ? "Academia desactivada." : "Academia activada.", "success");
      else notify(resultado.error, "error");
    });
  }

  if (!activa) {
    return (
      <Button
        size="small"
        variant="outlined"
        color="primary"
        disabled={pendiente}
        onClick={ejecutar}
        startIcon={pendiente ? <CircularProgress size={14} color="inherit" /> : undefined}
      >
        {pendiente ? "Activando..." : "Activar"}
      </Button>
    );
  }

  return (
    <>
      <Button size="small" variant="outlined" color="error" onClick={() => setAbierto(true)}>
        Desactivar
      </Button>
      <ConfirmDialog
        open={abierto}
        titulo="Desactivar academia"
        descripcion={`¿Seguro que quieres desactivar "${nombreAcademia}"? Dejará de contarse como academia activa en resúmenes y reportes.`}
        etiquetaConfirmar="Desactivar"
        colorConfirmar="error"
        pendiente={pendiente}
        onConfirmar={ejecutar}
        onCancelar={() => setAbierto(false)}
      />
    </>
  );
}
