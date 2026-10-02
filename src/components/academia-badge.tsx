import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";
import type { Academia } from "@/lib/types";

export function AcademiaBadge({ academia, size = "small" }: { academia: Academia; size?: "small" | "medium" }) {
  return (
    <Chip
      size={size}
      label={academia.nombre}
      sx={{
        bgcolor: alpha(academia.color, 0.14),
        color: academia.color,
        fontWeight: 700,
      }}
    />
  );
}
