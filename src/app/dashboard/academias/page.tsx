import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AcademiaActivaToggle } from "@/components/academia-activa-toggle";
import { AcademiaBadge } from "@/components/academia-badge";
import { GrupoForm } from "@/components/grupo-form";
import { GrupoItem } from "@/components/grupo-item";
import { LinkButton } from "@/components/link-button";
import { obtenerStore } from "@/lib/store";

export default function AcademiasPage() {
  const store = obtenerStore();

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="h5">Academias</Typography>
        <LinkButton href="/dashboard/academias/nueva" variant="contained" startIcon={<AddRoundedIcon />}>
          Nueva academia
        </LinkButton>
      </Stack>

      <Stack spacing={2}>
        {store.academias.map((academia) => {
          const grupos = store.grupos
            .filter((g) => g.academiaId === academia.id)
            .sort((a, b) => a.orden - b.orden);

          return (
            <Card key={academia.id}>
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <Stack spacing={0.75}>
                    <AcademiaBadge academia={academia} size="medium" />
                    <Typography variant="body2" color="text.secondary">
                      {academia.tipoCobro === "calendario"
                        ? `Vence el día ${academia.diaCorte} de cada mes`
                        : "Vence el día de inscripción de cada alumno"}{" "}
                      · {academia.diasGracia} días de gracia
                    </Typography>
                    {!academia.activa && <Chip size="small" label="Inactiva" sx={{ width: "fit-content" }} />}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <LinkButton
                      href={`/dashboard/academias/${academia.id}/editar`}
                      size="small"
                      startIcon={<EditRoundedIcon fontSize="small" />}
                    >
                      Editar
                    </LinkButton>
                    <AcademiaActivaToggle
                      academiaId={academia.id}
                      nombreAcademia={academia.nombre}
                      activa={academia.activa}
                    />
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="overline" color="text.secondary">
                  Grupos / niveles
                </Typography>
                <Stack spacing={0} sx={{ mt: 0.5 }}>
                  {grupos.map((grupo) => (
                    <GrupoItem key={grupo.id} grupo={grupo} />
                  ))}
                  {grupos.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Todavía no hay grupos.
                    </Typography>
                  )}
                </Stack>
                <Box sx={{ mt: 1.5, maxWidth: 320 }}>
                  <GrupoForm academiaId={academia.id} />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
}
