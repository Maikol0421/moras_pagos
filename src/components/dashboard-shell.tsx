"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import CardMembershipRoundedIcon from "@mui/icons-material/CardMembershipRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import { logoutAction } from "@/lib/actions-auth";
import type { Usuario } from "@/lib/types";

const ANCHO_DRAWER = 264;

interface ItemNav {
  href: string;
  etiqueta: string;
  Icono: React.ComponentType<{ fontSize?: "small" | "medium" | "large" }>;
}

const NAV_PRINCIPAL: ItemNav[] = [
  { href: "/dashboard", etiqueta: "Resumen", Icono: SpaceDashboardRoundedIcon },
  { href: "/dashboard/alumnos", etiqueta: "Alumnos", Icono: GroupRoundedIcon },
  { href: "/dashboard/pagos", etiqueta: "Pagos", Icono: PaymentsRoundedIcon },
  { href: "/dashboard/asistencia", etiqueta: "Asistencia", Icono: EventAvailableRoundedIcon },
  { href: "/dashboard/reportes", etiqueta: "Reportes", Icono: BarChartRoundedIcon },
];

const NAV_CONFIG: ItemNav[] = [
  { href: "/dashboard/academias", etiqueta: "Academias", Icono: SchoolRoundedIcon },
  { href: "/dashboard/planes", etiqueta: "Planes", Icono: CardMembershipRoundedIcon },
];

function coincide(pathname: string, href: string): boolean {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function DashboardShell({ usuario, children }: { usuario: Usuario; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerAbierto, setDrawerAbierto] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [, startTransition] = React.useTransition();

  const itemActivo = [...NAV_PRINCIPAL, ...NAV_CONFIG].find((item) => coincide(pathname, item.href));
  const titulo = itemActivo?.etiqueta ?? "Panel";

  function cerrarSesion() {
    setMenuAnchor(null);
    startTransition(() => {
      void logoutAction();
    });
  }

  const listaNav = (items: ItemNav[]) => (
    <List sx={{ px: 1 }}>
      {items.map(({ href, etiqueta, Icono }) => (
        <ListItemButton
          key={href}
          component={Link}
          href={href}
          selected={coincide(pathname, href)}
          onClick={() => setDrawerAbierto(false)}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            "&.Mui-selected": { bgcolor: "primary.main", color: "primary.contrastText" },
            "&.Mui-selected:hover": { bgcolor: "primary.dark" },
            "&.Mui-selected .MuiListItemIcon-root": { color: "primary.contrastText" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Icono fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={etiqueta} />
        </ListItemButton>
      ))}
    </List>
  );

  const contenidoDrawer = (
    <Box sx={{ width: ANCHO_DRAWER, display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
          🎵 Academia
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Panel administrativo
        </Typography>
      </Box>
      <Divider />
      {listaNav(NAV_PRINCIPAL)}
      <Divider sx={{ my: 1 }} />
      <Typography variant="overline" color="text.secondary" sx={{ px: 2.5, fontWeight: 700 }}>
        Configuración
      </Typography>
      {listaNav(NAV_CONFIG)}
      <Box sx={{ mt: "auto", p: 1.5 }}>
        <Divider sx={{ mb: 1.5 }} />
        <ListItemButton onClick={cerrarSesion} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: ANCHO_DRAWER,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: ANCHO_DRAWER, boxSizing: "border-box", border: "none", borderRight: "1px solid rgba(30,27,46,0.08)" },
        }}
      >
        {contenidoDrawer}
      </Drawer>

      <Drawer
        variant="temporary"
        open={drawerAbierto}
        onClose={() => setDrawerAbierto(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: ANCHO_DRAWER } }}
      >
        {contenidoDrawer}
      </Drawer>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppBar position="sticky" color="inherit" sx={{ bgcolor: "background.paper" }}>
          <Toolbar sx={{ gap: 1 }}>
            <IconButton edge="start" onClick={() => setDrawerAbierto(true)} sx={{ display: { md: "none" } }}>
              <MenuRoundedIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {titulo}
            </Typography>
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14 }}>
                {usuario.nombre.slice(0, 1).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              <MenuItem disabled sx={{ opacity: "1 !important" }}>
                <Stack>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {usuario.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {usuario.email}
                  </Typography>
                </Stack>
              </MenuItem>
              <Divider />
              <MenuItem onClick={cerrarSesion}>
                <ListItemIcon>
                  <LogoutRoundedIcon fontSize="small" />
                </ListItemIcon>
                Cerrar sesión
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, pb: { xs: 10, md: 3 }, maxWidth: 1280, width: "100%", mx: "auto" }}
        >
          {children}
        </Box>

        <Paper
          elevation={8}
          sx={{ display: { xs: "block", md: "none" }, position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1200 }}
        >
          <BottomNavigation
            showLabels
            value={itemActivo?.href ?? false}
            onChange={(_event, valor: string) => router.push(valor)}
            sx={{ height: 64 }}
          >
            {NAV_PRINCIPAL.map(({ href, etiqueta, Icono }) => (
              <BottomNavigationAction key={href} label={etiqueta} value={href} icon={<Icono />} />
            ))}
          </BottomNavigation>
        </Paper>
      </Box>
    </Box>
  );
}
