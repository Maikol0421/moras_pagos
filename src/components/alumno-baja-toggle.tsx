"use client";

import { useState, useTransition } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast-provider";
import { cambiarBajaAlumnoAction } from "@/lib/actions-alumnos";

export function AlumnoBajaToggle({
  alumnoId,
  nombreAlumno,
  baja,
}: {
  alumnoId: string;
  nombreAlumno: string;
  baja: boolean;
}) {
  const [pendiente, startTransition] = useTransition();
  const [abierto, setAbierto] = useState(false);
  const { notify } = useToast();

  function ejecutar() {
    startTransition(async () => {
      const resultado = await cambiarBajaAlumnoAction(alumnoId, !baja);
      setAbierto(false);
      if (resultado.ok) notify(baja ? "Alumno reactivado." : "Alumno dado de baja.", "success");
      else notify(resultado.error, "error");
    });
  }

  if (baja) {
    return (
      <Button
        variant="outlined"
        color="primary"
        disabled={pendiente}
        onClick={ejecutar}
        startIcon={pendiente ? <CircularProgress size={16} color="inherit" /> : undefined}
      >
        {pendiente ? "Reactivando..." : "Reactivar alumno"}
      </Button>
    );
  }

  return (
    <>
      <Button variant="outlined" color="error" onClick={() => setAbierto(true)}>
        Dar de baja
      </Button>
      <ConfirmDialog
        open={abierto}
        titulo="Dar de baja al alumno"
        descripcion={`¿Seguro que quieres dar de baja a ${nombreAlumno}? Dejará de contar como alumno activo y no se le generarán más pagos.`}
        etiquetaConfirmar="Dar de baja"
        colorConfirmar="error"
        pendiente={pendiente}
        onConfirmar={ejecutar}
        onCancelar={() => setAbierto(false)}
      />
    </>
  );
}
