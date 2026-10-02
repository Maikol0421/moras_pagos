# Arquitectura, stack y autenticación

Este documento resume cómo está construido este proyecto para poder reutilizar el
mismo patrón en uno nuevo. No repite el modelo de datos (eso vive en
`SCHEMA_BACK.md`) ni las instrucciones de desarrollo local (eso vive en
`README.md`) — es la vista "cómo está armado y por qué".

## 1. Stack

| Capa | Elección | Por qué |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components + Server Actions cubren todo sin una API separada |
| UI | React 19 + MUI v9 (`@mui/material`, `@mui/icons-material`, `@mui/system`) + Emotion | Componentes listos, theming centralizado |
| SSR de MUI | `@mui/material-nextjs` (`AppRouterCacheProvider`, import `.../v16-appRouter`) | Inserta los estilos de Emotion correctamente con App Router |
| Lenguaje | TypeScript estricto (`tsconfig.json`, `strict: true`), alias `@/*` → `./src/*` | — |
| Base de datos | PostgreSQL (Supabase), driver **`postgres`** (postgres.js) | Acceso SQL directo, sin ORM ni `@supabase/supabase-js` |
| Autenticación | JWT propio (`jose`) en cookie httpOnly + `bcryptjs` | No se usa Supabase Auth; la tabla de usuarios es propia del schema |
| PDF / QR | `jspdf` + `jspdf-autotable` (import dinámico), `qrcode` | Solo en los dos botones que los necesitan, para no inflar el bundle |
| Lint | ESLint 9 flat config + `eslint-config-next` | — |
| Testing | **ninguno** | No hay Jest/Vitest/Playwright instalado |
| Validación de forms | Regex/funciones propias (sin Zod) | Ver sección 4.4 |
| Deploy | Firebase App Hosting | SSR nativo de Next, variables/secretos vía `apphosting.yaml` + Secret Manager |

No hay rutas bajo `src/app/api/`: todo el acceso a datos pasa por Server
Components (leyendo en el render) o Server Actions (`"use server"`). El único
Route Handler existe por una razón puntual (sección 3.5).

## 2. Estructura de carpetas

```
src/
├── proxy.ts               # Next 16 renombró middleware.ts → proxy.ts (ver nota abajo)
├── app/                    # App Router: páginas y layouts, sin lógica de negocio
│   ├── login/              # Público
│   ├── registro/           # Público — alta de solicitud de acceso
│   ├── cambiar-password/   # Protegido
│   ├── sesion-invalida/route.ts  # Único Route Handler del proyecto
│   └── dashboard/          # Protegido (layout valida sesión una vez para todas las subrutas)
├── components/             # Todo client-side UI, sin subcarpetas, nombres en español
└── lib/                     # Toda la lógica de servidor + utilidades
    ├── db.ts                # Cliente SQL singleton
    ├── auth.ts               # Firma/verificación de JWT
    ├── session.ts             # "Quién es el usuario actual" para Server Components
    ├── actions.ts              # Server Actions de login/logout/cambio de password
    ├── repositorio.ts          # Única capa de acceso a datos (todas las queries)
    └── *-actions.ts, rate-limit.ts, etc.
```

**Convención a replicar:** `lib/` se divide por *responsabilidad técnica*
(conexión, auth, sesión, acceso a datos, acciones), no por entidad de negocio.
Con un dominio de este tamaño, un único `repositorio.ts` es más fácil de
auditar para seguridad (acotar `tutorId`, por ejemplo) que repartir queries
entre muchos archivos.

### Nota: `middleware.ts` ya no existe en Next.js 16

Este repo corre sobre una versión de Next con cambios que rompen con lo que
cualquier modelo o desarrollador "ya sabe" (de ahí el aviso en `AGENTS.md`). El
caso concreto más relevante para auth: el archivo de middleware se **renombró
a `src/proxy.ts`**, exportando una función `proxy()` (no `middleware()`) y el
mismo `config.matcher` de siempre. Si el proyecto nuevo usa Next 16+, hay que
leer `node_modules/next/dist/docs/` antes de asumir convenciones de versiones
anteriores — no solo en auth, en general.

## 3. Autenticación, de punta a punta

Diseño: **el JWT solo identifica, nunca autoriza**. El payload es mínimo
(`{ tutorId }`); en cada request protegido se vuelve a consultar la base para
traer el estado real del usuario. Esto evita el problema clásico de JWTs con
roles/permisos embebidos: si revocas el acceso de alguien, con ese patrón
tendría que esperar a que expire el token. Aquí la revocación es inmediata
porque la fuente de verdad siempre es la base, no el token.

### 3.1 Login → emisión del token

`actions.ts` (Server Action `"use server"`):

```ts
const tutorId = await validarCredenciales(identificador, password); // bcrypt.compare internamente
if (!tutorId) return { error: "Usuario o contraseña incorrectos." }; // mensaje genérico, nunca dice cuál campo falló

const token = await crearSessionToken({ tutorId });
const store = await cookies();
store.set(SESSION_COOKIE, token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // false en local para probar sin HTTPS
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_COOKIE_MAX_AGE, // 8h, igual a la expiración del JWT
});
redirect("/dashboard");
```

### 3.2 Firma y verificación del JWT (`auth.ts`)

```ts
export type SessionPayload = { tutorId: string }; // payload mínimo, a propósito

export async function crearSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("28800s") // 8h
    .sign(getSecretKey()); // process.env.JWT_SECRET
}

export async function verificarSessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.tutorId !== "string") return null;
    return { tutorId: payload.tutorId };
  } catch {
    return null; // firma inválida, expirado, lo que sea → tratar como "no hay sesión"
  }
}
```

Librería: `jose` (no `jsonwebtoken` — corre en el Edge runtime del proxy sin
depender de APIs de Node). Secreto: `JWT_SECRET` por variable de entorno, en
producción inyectado como secreto de Secret Manager vía `apphosting.yaml`.

### 3.3 Dos capas de verificación (y por qué ambas)

1. **`proxy.ts`** (equivalente al middleware) — solo valida la *firma* del
   JWT para redirigir rápido, sin tocar la base de datos:

   ```ts
   export async function proxy(request: NextRequest) {
     const token = request.cookies.get(SESSION_COOKIE)?.value;
     const session = token ? await verificarSessionToken(token) : null;
     const { pathname } = request.nextUrl;

     if ((pathname.startsWith("/dashboard") || pathname === "/cambiar-password") && !session) {
       return NextResponse.redirect(new URL("/login", request.url));
     }
     if (pathname === "/login" && session) {
       return NextResponse.redirect(new URL("/dashboard", request.url));
     }
     if (pathname === "/") {
       return NextResponse.redirect(new URL(session ? "/dashboard" : "/login", request.url));
     }
     return NextResponse.next();
   }

   export const config = { matcher: ["/", "/login", "/dashboard/:path*", "/cambiar-password"] };
   ```

2. **`session.ts`** — la verificación real, dentro de los Server Components:

   ```ts
   export const getTutorActual = cache(async (): Promise<Tutor | null> => {
     const token = (await cookies()).get(SESSION_COOKIE)?.value;
     if (!token) return null;
     const payload = await verificarSessionToken(token);
     if (!payload) return null;
     return obtenerTutorConHijos(payload.tutorId); // SIEMPRE fresco de la BD
   });

   export async function requireTutorActual(): Promise<Tutor> {
     const tutor = await getTutorActual();
     if (!tutor) redirect("/sesion-invalida");
     return tutor;
   }
   ```

   `cache()` de React memoiza la consulta **dentro de un mismo request**, así
   que si el layout y la página llaman `requireTutorActual()` ambos, la query
   a la base solo corre una vez. `requireTutorActual()` es lo único que
   importan las páginas/layouts protegidos — una línea, sin repetir lógica de
   auth en cada ruta.

**Por qué las dos capas:** el proxy evita el costo de tocar la base en cada
navegación solo para decidir "¿hay sesión o no?", pero por sí solo no sabe si
el usuario sigue existiendo o conserva el acceso — eso solo lo sabe la base.
`requireTutorActual()` es la que realmente autoriza.

### 3.4 El caso "sesión zombi" y por qué hay un Route Handler

Si el JWT firma correctamente pero el tutor ya no existe o le revocaron el
acceso, `requireTutorActual()` no puede simplemente `redirect("/login")`:
un Server Component no puede borrar cookies durante el render (solo Server
Actions o Route Handlers pueden), y si la cookie sigue viva, el `proxy.ts` la
vería como sesión válida y rebotaría de vuelta a `/dashboard` → loop infinito.

Por eso existe `src/app/sesion-invalida/route.ts`: un **Route Handler GET**
cuyo único trabajo es borrar la cookie y redirigir a `/login`.

```ts
export async function GET() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
```

Este es el único punto del proyecto donde hizo falta un Route Handler en vez
de un Server Action — vale la pena recordar el patrón si el proyecto nuevo
tiene el mismo problema (sesión firmada pero inválida).

### 3.5 Logout

```ts
export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
```

Invocado desde un `<form action={logoutAction}>` sin JS adicional.

### 3.6 bcryptjs

Todo vive en `repositorio.ts`:
- **Login:** `bcrypt.compare(password, tutor.password_hash)` — si el usuario
  no existe, está inactivo, o no tiene hash, regresa `null` igual que una
  contraseña incorrecta (mismo mensaje genérico en el cliente).
- **Cambio de password:** valida la actual con `bcrypt.compare`, genera la
  nueva con `bcrypt.hash(password, 10)` (cost factor 10).

### 3.7 Roles / autorización

No hay sistema de roles en esta app — todo usuario autenticado tiene el mismo
nivel de acceso (solo a sus propios datos, nunca a los de otro usuario). La
única regla de negocio parecida a un permiso es un campo `tipo` en la tabla
puente (`principal` / `secundario`): la query que arma el perfil filtra
explícitamente por ese campo para no mostrarle a un tutor secundario datos
que no le corresponden. El `id` del usuario autenticado **siempre** sale del
JWT/sesión, nunca de un parámetro de ruta o del body — así ninguna query
puede ser manipulada para leer datos de otro usuario (anti-IDOR).

### 3.8 Validación de formularios (sin Zod)

Las reglas de formato (celular, correo, CURP, reglas de password) son
funciones/regex propias en archivos dedicados (`*-validacion.ts`,
`password.ts`) — no hay una librería de schema-validation. Los checks de
"¿ya existe este correo/celular?" se hacen en dos niveles: un pre-chequeo de
lectura (buena UX, responde rápido) y la restricción única real de Postgres
como última palabra (la UX no cierra la ventana de carrera entre dos
solicitudes simultáneas — el error de Postgres se mapea después a un mensaje
legible por `constraint_name`). Hay rate limiting en memoria (`Map` en
`globalThis`, documentado como no apto para multi-instancia) para las
verificaciones en vivo y los intentos de registro.

## 4. Capa de datos

### 4.1 Cliente SQL (`db.ts`) — patrón reutilizable tal cual

```ts
import "server-only";
import postgres from "postgres";

declare global {
  var __sqlClient: ReturnType<typeof postgres> | undefined;
}

function crearClienteSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Falta configurar DATABASE_URL");
  return postgres(connectionString, { ssl: "require", max: 5, prepare: false });
}

function obtenerCliente() {
  if (!globalThis.__sqlClient) globalThis.__sqlClient = crearClienteSql();
  return globalThis.__sqlClient;
}

// Proxy perezoso: no crea la conexión real al importar el módulo (el build de
// Next importa módulos solo para inspeccionarlos), sino en el primer uso.
export const sql = new Proxy(/* ... ver db.ts para el detalle completo ... */);
```

Tres decisiones a replicar si el proyecto nuevo también usa Supabase (o
cualquier Postgres detrás de un pooler de transacciones tipo PgBouncer/
Supavisor):
- **`prepare: false`** — el pooler de transacciones puede mandar cada
  statement a un backend físico distinto; un prepared statement con nombre
  creado en una conexión puede no existir en la siguiente (error intermitente
  `26000 prepared statement ... does not exist`). Con `prepare: false`,
  postgres.js manda cada query sin nombre, seguro contra el pooler.
- **Singleton en `globalThis`** — evita crear un pool nuevo en cada
  hot-reload de `next dev`.
- **Proxy perezoso** — si la variable de conexión solo está disponible en
  runtime (como en Firebase App Hosting) y no en build time, crear el cliente
  al importar el módulo rompe el build. El Proxy difiere la creación real
  hasta la primera query.

### 4.2 Repositorio (`repositorio.ts`) — un solo archivo de acceso a datos

Patrón: funciones `async` que usan tagged templates de `postgres.js`
(interpolación segura, sin concatenar strings):

```ts
const filas = await sql<FilaTutor[]>`
  select * from bd_comedor_kukulkan.tutores
  where activo = true and (lower(email) = lower(${identificador}) or celular = ${identificador})
  limit 1
`;
```

- Cada tabla se califica con el schema explícito (`bd_comedor_kukulkan.x`) en
  vez de depender de `search_path`, por la misma razón del pooler de
  transacciones (una sesión `SET search_path` no está garantizada entre
  queries).
- Tipos `FilaX` (forma cruda de la query) separados de los tipos de dominio
  limpios en `types.ts` (`Tutor`, `Hijo`, etc.) — una capa de mapeo entre lo
  que regresa SQL y lo que consume la UI.
- Mutaciones multi-tabla usan `sql.begin(async (tx) => {...})` (transacción
  real), no múltiples queries sueltas.
- Errores de Postgres se inspeccionan por `error.constraint_name` o
  `error.code === "23505"` (violación de unicidad) y se traducen a mensajes
  legibles — nunca se expone el error crudo al usuario.

### 4.3 Server Actions vs. Route Handlers

Casi todo es Server Actions (`"use server"`). El único Route Handler existe
por la razón puntual de la sección 3.4 (borrar cookie fuera de un render). Si
el proyecto nuevo no tiene ese caso, probablemente no necesite ningún Route
Handler tampoco.

## 5. Convenciones a replicar

1. **`import "server-only"`** como primera línea de todo módulo que toca
   secretos o la base de datos — falla en build time si un Client Component
   lo importa por error.
2. **Resultado explícito en vez de excepciones** para flujos de negocio:
   `{ ok: true } | { ok: false; error: string }`, nunca `throw` hacia el
   cliente con detalles internos.
3. **Mensajes de error siempre genéricos** de cara al usuario ("Usuario o
   contraseña incorrectos", nunca distinguir cuál campo falló).
4. **`cache()` de React** para memoizar lecturas costosas que varios
   Server Components puedan disparar dentro del mismo request.
5. **Comentarios que explican el porqué**, no el qué — útil en código con
   decisiones no obvias (el pooler, el Proxy perezoso, el loop de
   `sesion-invalida`).

## 6. Qué llevarte a un proyecto nuevo vs. qué es específico de este

**Reutilizable casi tal cual**, si el proyecto nuevo también usa Supabase/Postgres:
- `db.ts` completo (Proxy perezoso + `prepare: false` + singleton).
- El patrón de `auth.ts` + `session.ts` + `proxy.ts` (JWT mínimo, revalidación
  fresca contra la base, dos capas de verificación).
- El truco de `/sesion-invalida` si vas a tener el mismo problema de "JWT
  válido pero usuario ya no autorizado".

**Específico de este dominio**, hay que repensarlo:
- `repositorio.ts` como archivo único — bien para este tamaño de dominio;
  con más entidades probablemente convenga dividir por entidad.
- La ausencia de roles — este proyecto no los necesita porque cada usuario
  solo ve sus propios datos; un proyecto con roles de verdad (admin/staff)
  necesitaría meter eso en la consulta de autorización, no en el JWT.
- Sin Zod — válido aquí por la cantidad y simplicidad de los formularios; con
  formularios más complejos conviene una librería de schema-validation.
