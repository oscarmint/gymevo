'use client';

// Gráfico de VOLUMEN de compras por semana (17-VISUALIZACION-DATOS: Tufte,
// sin 3D ni rejas de grid). Muestra cantidad de compras, no dinero — el
// webhook de Hotmart todavía no guarda el monto cobrado (ver ResumenVentas
// en lib/admin.ts), así que un gráfico de "ingresos" sería un número inventado.

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import type { PuntoVentasPorSemana } from '@/lib/admin';

export function GraficoVentas({ datos }: { datos: PuntoVentasPorSemana[] }) {
  const hayDatos = datos.some((d) => d.compras > 0);

  if (!hayDatos) {
    return (
      <p className="py-10 text-center text-sm text-[var(--text-tertiary)]">
        Todavía no hay ninguna compra registrada en las últimas 8 semanas.
      </p>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="semana"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
          />
          <Tooltip
            cursor={{ fill: 'color-mix(in oklab, var(--text-tertiary) 10%, transparent)' }}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid color-mix(in oklab, var(--text-tertiary) 25%, transparent)',
              borderRadius: 10,
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
            formatter={(value) => `${value} compra${value === 1 ? '' : 's'}`}
          />
          <Bar dataKey="compras" fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
