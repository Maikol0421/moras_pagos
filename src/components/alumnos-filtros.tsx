"use client";

import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Academia, Grupo } from "@/lib/types";

export function AlumnosFiltros({ academias, grupos }: { academias: Academia[]; grupos: Grupo[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const academiaId = searchParams.get("academiaId") ?? "";
  const grupoId = searchParams.get("grupoId") ?? "";
  const estado = searchParams.get("estado") ?? "";
  const gruposFiltrados = academiaId ? grupos.filter((g) => g.academiaId === academiaId) : grupos;

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
        label="Academia"
        size="small"
        value={academiaId}
        onChange={(e) => actualizar({ academiaId: e.target.value, grupoId: "" })}
        sx={{ minWidth: { sm: 190 } }}
      >
        <MenuItem value="">Todas las academias</MenuItem>
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
        value={grupoId}
        onChange={(e) => actualizar({ grupoId: e.target.value })}
        sx={{ minWidth: { sm: 190 } }}
      >
        <MenuItem value="">Todos los grupos</MenuItem>
        {gruposFiltrados.map((g) => (
          <MenuItem key={g.id} value={g.id}>
            {g.nombre}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Estado"
        size="small"
        value={estado}
        onChange={(e) => actualizar({ estado: e.target.value })}
        sx={{ minWidth: { sm: 170 } }}
      >
        <MenuItem value="">Todos</MenuItem>
        <MenuItem value="activo">Activos</MenuItem>
        <MenuItem value="inactivo">Inactivos</MenuItem>
        <MenuItem value="baja">Baja</MenuItem>
      </TextField>
    </Stack>
  );
}
