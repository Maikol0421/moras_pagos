// La redirección real ("/" -> /login o /dashboard según la sesión) la hace
// src/proxy.ts antes de llegar aquí. Este componente casi nunca se renderiza.
export default function Home() {
  return null;
}
