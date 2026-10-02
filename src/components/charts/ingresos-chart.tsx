"use client";

import { BarChart } from "@mui/x-charts/BarChart";
import { formatearMoneda, nombrePeriodoCorto } from "@/lib/reglas-negocio";

interface IngresosChartProps {
  datos: { periodo: string; monto: number }[];
  altura?: number;
}

/** Ingresos cobrados por mes: serie única, color de marca, valor directo en el tope de cada barra. */
export function IngresosChart({ datos, altura = 260 }: IngresosChartProps) {
  const dataset = datos.map((d) => ({ ...d, etiqueta: nombrePeriodoCorto(d.periodo) }));

  return (
    <BarChart
      dataset={dataset}
      xAxis={[{ scaleType: "band", dataKey: "etiqueta", tickLabelStyle: { fontSize: 12 } }]}
      yAxis={[{ tickLabelStyle: { fontSize: 11 }, valueFormatter: (valor: number) => formatearMoneda(valor) }]}
      series={[
        {
          dataKey: "monto",
          label: "Ingresos",
          color: "#2a78d6",
          valueFormatter: (valor) => formatearMoneda(valor ?? 0),
          barLabel: (item) => formatearMoneda(item.value ?? 0),
          barLabelPlacement: "outside",
        },
      ]}
      height={altura}
      hideLegend
      borderRadius={4}
      grid={{ horizontal: true }}
      margin={{ top: 28, right: 16, bottom: 28, left: 16 }}
    />
  );
}
