# Panel de pagos — Academia de Música y Danza (demo)

Dashboard administrativo para gestionar pagos, asistencia y reportes de dos
(o más) academias con reglas de cobro distintas. Ver `ARQUITECTURA.md` para
el detalle del stack y los patrones replicados, y el plan original en
`.claude/plans` del historial de esta conversación para el alcance completo.

## Arrancar en local

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) — redirige a `/login`.

**Credenciales de la demo:** `admin@academia.com` / `Demo1234` (ya vienen
precargadas en el formulario).

## Qué es esto (y qué no)

- Frontend completo con **datos dummy generados en memoria** al arrancar el
  servidor (`src/lib/seed.ts`) — no hay base de datos todavía. Los cambios
  que hagas en la demo (marcar un pago, pasar lista, crear una academia)
  persisten mientras el servidor de desarrollo siga corriendo, pero se
  reinician si lo reinicias.
- El login sí es real: JWT (`jose`) en cookie httpOnly + `bcryptjs`, mismo
  patrón de dos capas (`src/proxy.ts` + `src/lib/session.ts`) pensado para
  reutilizarse tal cual cuando se conecte Postgres.
- Todo lo marcado como "configurable" en el encargo original es de verdad
  configurable desde la UI: academias (puedes crear una nueva, no solo
  Música/Danza), su tipo de cobro (calendario o aniversario), días de
  gracia, grupos/niveles por academia, planes y alumnos.

## Stack

Next.js 16 (App Router) + React 19 + TypeScript estricto + MUI v9 + Tailwind
CSS v4 (utilidades puntuales, sin pelear con el theme de MUI) + Zod +
`@mui/x-charts`. Ver `ARQUITECTURA.md` para el porqué de cada elección.

## Scripts

```bash
pnpm dev      # servidor de desarrollo (Turbopack)
pnpm build    # build de producción
pnpm start    # servir el build
pnpm lint     # ESLint
```
