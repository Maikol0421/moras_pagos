"use client";

import Button, { type ButtonProps } from "@mui/material/Button";
import Link from "next/link";

type LinkButtonProps = ButtonProps & { href: string };

/**
 * Un Server Component no puede pasarle `component={Link}` directamente a un
 * Button (Client Component de MUI) — Next.js no sabe serializar esa referencia
 * de función a través del límite servidor/cliente. Este wrapper ya es
 * "use client", así que `Link` se usa dentro del mismo módulo cliente.
 */
export function LinkButton({ href, ...props }: LinkButtonProps) {
  return <Button component={Link} href={href} {...props} />;
}
