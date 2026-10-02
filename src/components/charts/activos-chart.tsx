"use client";

import { BarChart } from "@mui/x-charts/BarChart";

export interface ActivosChartDato {
  nombre: string;
  activos: number;
  inactivos: number;
  [clave: string]: string | number;
}

interface ActivosChartProps {
  datos: ActivosChartDato[];
}

/**
 * Activos vs inactivos por categoría (academia o grupo/nivel): barra horizontal
 * apilada. Activos en verde (estado "bien"), inactivos en gris neutro — patrón
 * de "emphasis" (1 color con significado + gris de contexto) en vez de un par
 * rojo/verde, que falla el checeo de daltonismo en el validador de la skill.
 */
export function ActivosChart({ datos }: ActivosChartProps) {
  const altura = Math.max(datos.length * 52 + 56, 160);

  return (
    <BarChart
      layout="horizontal"
      dataset={datos}
      yAxis={[{ scaleType: "band", dataKey: "nombre", width: 128, tickLabelStyle: { fontSize: 12 } }]}
      xAxis={[{ tickLabelStyle: { fontSize: 11 } }]}
      series={[
        { dataKey: "activos", label: "Activos (al corriente)", stack: "total", color: "#0ca30c" },
        { dataKey: "inactivos", label: "Inactivos / sin pago", stack: "total", color: "#898781" },
      ]}
      height={altura}
      borderRadius={4}
      grid={{ vertical: true }}
      margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
      slotProps={{ legend: { direction: "horizontal" } }}
    />
  );
}
