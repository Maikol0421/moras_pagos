import Chip from "@mui/material/Chip";
import type { EstadoPago } from "@/lib/types";

const CONFIG: Record<EstadoPago, { label: string; color: "success" | "warning" | "error" }> = {
  pagado: { label: "Pagado", color: "success" },
  pendiente: { label: "Pendiente", color: "warning" },
  atrasado: { label: "Atrasado", color: "error" },
};

export function PagoStatusChip({ estado }: { estado: EstadoPago }) {
  const config = CONFIG[estado];
  return (
    <Chip
      size="small"
      label={config.label}
      color={config.color}
      variant={estado === "pagado" ? "filled" : "outlined"}
    />
  );
}
