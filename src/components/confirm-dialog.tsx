"use client";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

interface ConfirmDialogProps {
  open: boolean;
  titulo: string;
  descripcion?: string;
  etiquetaConfirmar?: string;
  colorConfirmar?: "primary" | "error";
  /** true mientras la acción confirmada se está ejecutando — bloquea los botones y muestra un spinner. */
  pendiente: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/** Modal de confirmación genérico para ediciones y bajas/desactivaciones. */
export function ConfirmDialog({
  open,
  titulo,
  descripcion,
  etiquetaConfirmar = "Confirmar",
  colorConfirmar = "primary",
  pendiente,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={() => !pendiente && onCancelar()} fullWidth maxWidth="xs">
      <DialogTitle>{titulo}</DialogTitle>
      {descripcion && (
        <DialogContent>
          <DialogContentText>{descripcion}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onCancelar} disabled={pendiente}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirmar}
          color={colorConfirmar}
          variant="contained"
          disabled={pendiente}
          startIcon={pendiente ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {pendiente ? "Procesando..." : etiquetaConfirmar}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
