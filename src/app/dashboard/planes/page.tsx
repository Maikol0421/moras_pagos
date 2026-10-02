import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AcademiaBadge } from "@/components/academia-badge";
import { LinkButton } from "@/components/link-button";
import { PlanActivoToggle } from "@/components/plan-activo-toggle";
import { formatearMoneda } from "@/lib/reglas-negocio";
import { obtenerStore } from "@/lib/store";

export default function PlanesPage() {
  const store = obtenerStore();

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="h5">Planes</Typography>
        <LinkButton href="/dashboard/planes/nuevo" variant="contained" startIcon={<AddRoundedIcon />}>
          Nuevo plan
        </LinkButton>
      </Stack>

      <Stack spacing={1.5}>
        {store.planes.map((plan) => {
          const academia = store.academias.find((a) => a.id === plan.academiaId)!;
          return (
            <Card key={plan.id}>
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {plan.nombre}
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                      <AcademiaBadge academia={academia} />
                      <Typography variant="body2" color="text.secondary">
                        {formatearMoneda(plan.costo)} · {plan.numeroClases} clases/mes
                      </Typography>
                      {!plan.activo && <Chip size="small" label="Inactivo" />}
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <LinkButton
                      href={`/dashboard/planes/${plan.id}/editar`}
                      size="small"
                      startIcon={<EditRoundedIcon fontSize="small" />}
                    >
                      Editar
                    </LinkButton>
                    <PlanActivoToggle planId={plan.id} nombrePlan={plan.nombre} activo={plan.activo} />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
        {store.planes.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            Todavía no hay planes.
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
