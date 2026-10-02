"use client";

import { useState, useTransition } from "react";
import Button from "@mui/material/Button";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast-provider";
import { revertirPagoAction } from "@/lib/actions-pagos";

export function RevertirPagoButton({ pagoId, nombreAlumno }: { pagoId: string; nombreAlumno: string }) {
  const [pendiente, startTransition] = useTransition();
  const [abierto, setAbierto] = useState(false);
  const { notify } = useToast();

  function ejecutar() {
    startTransition(async () => {
      const resultado = await revertirPagoAction(pagoId);
      setAbierto(false);
      if (resultado.ok) notify("Pago revertido a pendiente.", "success");
      else notify(resultado.error, "error");
    });
  }

  return (
    <>
      <Button size="small" color="inherit" onClick={() => setAbierto(true)}>
        Deshacer
      </Button>
      <ConfirmDialog
        open={abierto}
        titulo="Revertir pago"
        descripcion={`¿Quitar el pago registrado de ${nombreAlumno}? Volverá a quedar pendiente.`}
        etiquetaConfirmar="Revertir"
        colorConfirmar="error"
        pendiente={pendiente}
        onConfirmar={ejecutar}
        onCancelar={() => setAbierto(false)}
      />
    </>
  );
}
