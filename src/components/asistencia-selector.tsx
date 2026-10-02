"use client";

import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { hoyISO } from "@/lib/reglas-negocio";
import type { Academia, Grupo } from "@/lib/types";

export function AsistenciaSelector({ academias, grupos }: { academias: Academia[]; grupos: Grupo[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const grupoIdActual = searchParams.get("grupoId") ?? "";
  const grupoActual = grupos.find((g) => g.id === grupoIdActual);
  const academiaId = searchParams.get("academiaId") ?? grupoActual?.academiaId ?? "";
  const fecha = searchParams.get("fecha") ?? hoyISO();
  const gruposAcademia = academiaId ? grupos.filter((g) => g.academiaId === academiaId) : grupos;

  function actualizar(cambios: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor) params.set(clave, valor);
      else params.delete(clave);
    }
    if (!params.get("fecha")) params.set("fecha", hoyISO());
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
      <TextField
        select
        label="Academia"
        size="small"
        value={academiaId}
        onChange={(e) => actualizar({ academiaId: e.target.value, grupoId: "" })}
        sx={{ minWidth: { sm: 200 } }}
      >
        <MenuItem value="">Selecciona...</MenuItem>
        {academias.map((a) => (
          <MenuItem key={a.id} value={a.id}>
            {a.nombre}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Grupo / nivel"
        size="small"
        value={grupoIdActual}
        onChange={(e) => actualizar({ grupoId: e.target.value })}
        sx={{ minWidth: { sm: 200 } }}
        disabled={!academiaId}
      >
        <MenuItem value="">Selecciona...</MenuItem>
        {gruposAcademia.map((g) => (
          <MenuItem key={g.id} value={g.id}>
            {g.nombre}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        type="date"
        label="Fecha"
        size="small"
        value={fecha}
        onChange={(e) => actualizar({ fecha: e.target.value })}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ minWidth: { sm: 170 } }}
      />
    </Stack>
  );
}
