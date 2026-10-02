"use client";

import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { nombrePeriodo } from "@/lib/reglas-negocio";
import type { Academia } from "@/lib/types";

export function ReportesFiltros({ academias, periodos }: { academias: Academia[]; periodos: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const periodo = searchParams.get("periodo") ?? periodos[periodos.length - 1];
  const academiaId = searchParams.get("academiaId") ?? "";

  function actualizar(cambios: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor) params.set(clave, valor);
      else params.delete(clave);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
      <TextField
        select
        label="Periodo"
        size="small"
        value={periodo}
        onChange={(e) => actualizar({ periodo: e.target.value })}
        sx={{ minWidth: { sm: 190 } }}
      >
        {periodos
          .slice()
          .reverse()
          .map((p) => (
            <MenuItem key={p} value={p}>
              {nombrePeriodo(p)}
            </MenuItem>
          ))}
      </TextField>
      <TextField
        select
        label="Grupos/niveles de..."
        size="small"
        value={academiaId}
        onChange={(e) => actualizar({ academiaId: e.target.value })}
        sx={{ minWidth: { sm: 220 } }}
      >
        <MenuItem value="">Todas las academias</MenuItem>
        {academias.map((a) => (
          <MenuItem key={a.id} value={a.id}>
            {a.nombre}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
