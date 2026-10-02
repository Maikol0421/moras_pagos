"use client";

import * as React from "react";
import Alert, { type AlertColor } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

interface ToastMessage {
  key: number;
  message: string;
  severity: AlertColor;
}

interface ToastContextValue {
  notify: (message: string, severity?: AlertColor) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const contexto = React.useContext(ToastContext);
  if (!contexto) throw new Error("useToast debe usarse dentro de <ToastProvider>.");
  return contexto;
}

let contadorToast = 0;

/**
 * Cola simple de notificaciones (patrón "consecutive snackbars" de MUI): solo
 * un Snackbar visible a la vez, los siguientes esperan su turno en `cola`.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [cola, setCola] = React.useState<ToastMessage[]>([]);
  const [mensajeActual, setMensajeActual] = React.useState<ToastMessage | undefined>(undefined);
  const [abierto, setAbierto] = React.useState(false);

  const notify = React.useCallback((message: string, severity: AlertColor = "success") => {
    contadorToast += 1;
    setCola((previa) => [...previa, { key: contadorToast, message, severity }]);
  }, []);

  React.useEffect(() => {
    // Cola de notificaciones externas (notify() puede llamarse desde cualquier
    // componente): este efecto solo avanza la cola, no deriva estado local.
    if (cola.length > 0 && !mensajeActual) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMensajeActual(cola[0]);
      setCola((previa) => previa.slice(1));
      setAbierto(true);
    } else if (cola.length > 0 && mensajeActual && abierto) {
      setAbierto(false);
    }
  }, [cola, mensajeActual, abierto]);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        key={mensajeActual?.key}
        open={abierto}
        autoHideDuration={3500}
        onClose={(_evento, razon) => {
          if (razon !== "clickaway") setAbierto(false);
        }}
        slotProps={{ transition: { onExited: () => setMensajeActual(undefined) } }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: { xs: 8, sm: 2 } }}
      >
        <Alert
          severity={mensajeActual?.severity ?? "success"}
          variant="filled"
          onClose={() => setAbierto(false)}
          sx={{ width: "100%" }}
        >
          {mensajeActual?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
