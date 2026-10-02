import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireSesionActual } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const usuario = await requireSesionActual();
  return <DashboardShell usuario={usuario}>{children}</DashboardShell>;
}
