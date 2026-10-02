"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { loginAction } from "@/lib/actions-auth";

function BotonEntrar() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="contained"
      size="large"
      fullWidth
      disabled={pending}
      startIcon={pending ? <CircularProgress size={18} color="inherit" /> : undefined}
    >
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  );
}

export function LoginForm() {
  const [estado, formAction] = useActionState(loginAction, null);

  return (
    <Card elevation={3} sx={{ width: "100%", maxWidth: 420 }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={0.5} sx={{ mb: 3 }}>
          <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>
            Academia · Panel de pagos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Inicia sesión para administrar pagos, asistencia y reportes.
          </Typography>
        </Stack>

        <Box component="form" action={formAction}>
          <Stack spacing={2}>
            {estado?.error && <Alert severity="error">{estado.error}</Alert>}
            <TextField
              name="email"
              type="email"
              label="Correo"
              defaultValue="admin@academia.com"
              required
              fullWidth
              autoComplete="email"
            />
            <TextField
              name="password"
              type="password"
              label="Contraseña"
              defaultValue="Demo1234"
              required
              fullWidth
              autoComplete="current-password"
            />
            <BotonEntrar />
          </Stack>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2.5, textAlign: "center" }}>
          Acceso de demostración: <strong>admin@academia.com</strong> / <strong>Demo1234</strong>
        </Typography>
      </CardContent>
    </Card>
  );
}
