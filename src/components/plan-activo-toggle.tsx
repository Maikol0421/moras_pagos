"use client";

import { useState, useTransition } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast-provider";
import { cambiarActivoPlanAction } from "@/lib/actions-config";

export function PlanActivoToggle({
  planId,
  nombrePlan,
  activo,
}: {
  planId: string;
  nombrePlan: string;
  activo: boolean;
}) {
  const [pendiente, startTransition] = useTransition();
  const [abierto, setAbierto] = useState(false);
  const { notify } = useToast();

  function ejecutar() {
    startTransition(async () => {
      const resultado = await cambiarActivoPlanAction(planId, !activo);
      setAbierto(false);
      if (resultado.ok) notify(activo ? "Plan desactivado." : "Plan activado.", "success");
      else notify(resultado.error, "error");
    });
  }

  if (!activo) {
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
        titulo="Desactivar plan"
        descripcion={`¿Seguro que quieres desactivar el plan "${nombrePlan}"? Ya no podrá asignarse a nuevos alumnos.`}
        etiquetaConfirmar="Desactivar"
        colorConfirmar="error"
        pendiente={pendiente}
        onConfirmar={ejecutar}
        onCancelar={() => setAbierto(false)}
      />
    </>
  );
}
