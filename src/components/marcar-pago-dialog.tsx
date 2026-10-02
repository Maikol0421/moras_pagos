"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useToast } from "./toast-provider";
import { registrarPagoAction } from "@/lib/actions-pagos";

function BotonConfirmar() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="contained"
      disabled={pending}
      startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
    >
      {pending ? "Guardando..." : "Confirmar pago"}
    </Button>
  );
}

export function MarcarPagoDialog({
  pagoId,
  nombreAlumno,
  montoTexto,
}: {
  pagoId: string;
  nombreAlumno: string;
  montoTexto: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [estado, formAction, pendiente] = useActionState(registrarPagoAction, null);
  const { notify } = useToast();

  useEffect(() => {
    // Sincroniza con el resultado del Server Action (sistema externo), no con props/estado local.
    if (estado?.ok) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAbierto(false);
      notify("Pago registrado.", "success");
    }
  }, [estado, notify]);

  return (
    <>
      <Button size="small" variant="contained" onClick={() => setAbierto(true)}>
        Marcar pagado
      </Button>
      <Dialog open={abierto} onClose={() => !pendiente && setAbierto(false)} fullWidth maxWidth="xs">
        <DialogTitle>Registrar pago</DialogTitle>
        <Box component="form" action={formAction}>
          <DialogContent>
            <Stack spacing={2}>
              {estado && !estado.ok && <Alert severity="error">{estado.error}</Alert>}
              <Typography variant="body2" color="text.secondary">
                {nombreAlumno} · {montoTexto}
              </Typography>
              <input type="hidden" name="pagoId" value={pagoId} />
              <TextField select name="metodoPago" label="Método de pago" defaultValue="Efectivo" required fullWidth>
                <MenuItem value="Efectivo">Efectivo</MenuItem>
                <MenuItem value="Transferencia">Transferencia</MenuItem>
                <MenuItem value="Tarjeta">Tarjeta</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAbierto(false)} disabled={pendiente}>
              Cancelar
            </Button>
            <BotonConfirmar />
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
