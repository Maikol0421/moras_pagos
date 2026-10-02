"use client";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AcademiaBadge } from "./academia-badge";
import { PagoStatusChip } from "./pago-status-chip";
import type { Academia, Alumno, EstadoPago, Grupo, Plan } from "@/lib/types";

interface AlumnoCardProps {
  alumno: Alumno;
  academia: Academia;
  grupo: Grupo;
  plan: Plan;
  estadoPago: EstadoPago | null;
  clasesRestantes: number;
}

export function AlumnoCard({ alumno, academia, grupo, plan, estadoPago, clasesRestantes }: AlumnoCardProps) {
  return (
    <Card>
      <CardActionArea component={Link} href={`/dashboard/alumnos/${alumno.id}`} sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <Stack>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {alumno.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {grupo.nombre} · {plan.nombre}
              </Typography>
            </Stack>
            {alumno.baja ? (
              <Chip size="small" label="Baja" />
            ) : (
              estadoPago && <PagoStatusChip estado={estadoPago} />
            )}
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <AcademiaBadge academia={academia} />
            <Typography variant="caption" color="text.secondary">
              {clasesRestantes} clases restantes
            </Typography>
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
}
