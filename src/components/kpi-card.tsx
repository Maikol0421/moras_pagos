import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import type SvgIcon from "@mui/material/SvgIcon";

interface KpiCardProps {
  etiqueta: string;
  valor: string;
  ayuda?: string;
  color?: string;
  Icono?: typeof SvgIcon;
}

export function KpiCard({ etiqueta, valor, ayuda, color = "#4F46E5", Icono }: KpiCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {etiqueta}
            </Typography>
            <Typography variant="h4">{valor}</Typography>
            {ayuda && (
              <Typography variant="caption" color="text.secondary">
                {ayuda}
              </Typography>
            )}
          </Stack>
          {Icono && (
            <Stack
              sx={{
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: "50%",
                bgcolor: alpha(color, 0.12),
                flexShrink: 0,
              }}
            >
              <Icono sx={{ color }} fontSize="small" />
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
