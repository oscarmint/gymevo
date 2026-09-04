// RESUMEN DEL PANEL — cards con dato héroe + insight en lenguaje claro
// (17-VISUALIZACION-DATOS: Tufte, un dato héroe por card). Ningún número se
// inventa: lo que no tiene fuente real hoy se rotula "Sin datos".

import { AlertTriangle, CheckCircle2, DollarSign, Dumbbell, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { calcularAvisos, obtenerChurn, obtenerResumenUso, obtenerResumenUsuarios, obtenerResumenVentas, obtenerVentasPorSemana } from '@/lib/admin';
import { GraficoVentas } from './GraficoVentas';

const ESTADO_CHURN_LABEL: Record<string, string> = {
  cancelled: 'Canceló',
  expired: 'Se le venció',
  refunded: 'Reembolso',
  chargeback: 'Contracargo',
};

function formatearFecha(iso: string | null): string {
  if (!iso) return 'nunca';
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function Card({
  icono: Icono,
  titulo,
  heroe,
  insight,
}: {
  icono: React.ElementType;
  titulo: string;
  heroe: string;
  insight: string;
}) {
  return (
    <div className="superficie-3d rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
      <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
        <Icono size={15} />
        <p className="text-xs font-semibold uppercase tracking-[0.05em]">{titulo}</p>
      </div>
      <p className="mt-2 text-3xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">{heroe}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{insight}</p>
    </div>
  );
}

function CardSinDatos({ icono: Icono, titulo, motivo }: { icono: React.ElementType; titulo: string; motivo: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] p-5 opacity-70">
      <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
        <Icono size={15} />
        <p className="text-xs font-semibold uppercase tracking-[0.05em]">{titulo}</p>
      </div>
      <p className="mt-2 text-lg font-semibold text-[var(--text-tertiary)]">Sin datos</p>
      <p className="mt-1 text-sm text-[var(--text-tertiary)]">{motivo}</p>
    </div>
  );
}

export default async function AdminPage() {
  const [ventas, usuarios, uso, avisos, churn, ventasPorSemana] = await Promise.all([
    obtenerResumenVentas(),
    obtenerResumenUsuarios(),
    obtenerResumenUso(),
    calcularAvisos(),
    obtenerChurn(),
    obtenerVentasPorSemana(),
  ]);

  const activos = ventas.porEstado.active ?? 0;
  const trialing = ventas.porEstado.trialing ?? 0;
  const cancelados = (ventas.porEstado.cancelled ?? 0) + (ventas.porEstado.expired ?? 0);

  return (
    <div className="flex flex-col gap-6">
      {/* AVISOS — banner arriba de todo (21-BACKOFFICE) */}
      <div className="flex flex-col gap-2">
        {avisos.map((a, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
              a.tipo === 'ok'
                ? 'border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] text-[var(--text-primary)]'
                : 'border-[color-mix(in_oklab,var(--status-warning)_35%,transparent)] bg-[color-mix(in_oklab,var(--status-warning)_8%,transparent)] text-[var(--text-primary)]'
            }`}
          >
            {a.tipo === 'ok' ? (
              <CheckCircle2 size={17} color="var(--accent)" className="mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle size={17} color="var(--status-warning)" className="mt-0.5 shrink-0" />
            )}
            <p>{a.mensaje}</p>
          </div>
        ))}
      </div>

      {/* VENTAS */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Ventas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card icono={TrendingUp} titulo="Compras totales" heroe={String(ventas.totalCompras)} insight={`Última: ${formatearFecha(ventas.ultimaCompra)}`} />
          <Card icono={Users} titulo="Suscriptores activos" heroe={String(activos)} insight={`${trialing} en prueba · ${cancelados} cancelados`} />
        </div>
        <div className="mt-3">
          <CardSinDatos
            icono={DollarSign}
            titulo="Ingresos / MRR"
            motivo="El webhook de Hotmart todavía no guarda el monto de cada cobro — hay que agregarlo antes de poder mostrar ingresos reales."
          />
        </div>
        <div className="superficie-3d mt-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">Compras por semana</p>
          <div className="mt-3">
            <GraficoVentas datos={ventasPorSemana} />
          </div>
        </div>
      </section>

      {/* USUARIOS */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Usuarios</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card icono={Users} titulo="Total de usuarios" heroe={String(usuarios.total)} insight={`${usuarios.porPlan.pro ?? 0} con plan pro`} />
          <Card icono={TrendingUp} titulo="Altas últimos 7 días" heroe={String(usuarios.altasUltimos7Dias)} insight={`${usuarios.altasUltimos30Dias} en los últimos 30 días`} />
        </div>
      </section>

      {/* CHURN — quién cancela (58-RETENCION-DE-INGRESOS) */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Churn — quién cancela</h2>
        {churn.total === 0 ? (
          <CardSinDatos icono={TrendingDown} titulo="Cancelaciones" motivo="Nadie ha cancelado, vencido, pedido reembolso o hecho contracargo todavía." />
        ) : (
          <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
            <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
              <TrendingDown size={15} />
              <p className="text-xs font-semibold uppercase tracking-[0.05em]">Total histórico</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">{churn.total}</p>
            <div className="mt-4 flex flex-col gap-2 border-t border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] pt-4">
              {churn.ultimos.map((u) => (
                <div key={u.email} className="flex items-center justify-between gap-3 text-sm">
                  <p className="truncate text-[var(--text-primary)]">{u.email}</p>
                  <span className="shrink-0 text-xs font-semibold text-[var(--status-warning)]">{ESTADO_CHURN_LABEL[u.status] ?? u.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* USO */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Uso</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card
            icono={Dumbbell}
            titulo="Series registradas (7 días)"
            heroe={String(uso.seriesUltimos7Dias)}
            insight={`${uso.usuariosConRegistroUltimos7Dias} usuario(s) entrenaron esta semana`}
          />
          <Card icono={Dumbbell} titulo="Series registradas (total)" heroe={String(uso.totalSeriesRegistradas)} insight={`Último registro: ${formatearFecha(uso.ultimoRegistro)}`} />
        </div>
      </section>

      {/* GANANCIA REAL */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Ganancia real</h2>
        <CardSinDatos
          icono={DollarSign}
          titulo="Ganancia del mes"
          motivo="Depende de los ingresos, que hoy son Sin datos (ver arriba). Se activa en cuanto el webhook guarde el monto de cada cobro."
        />
      </section>

      {/* NEGOCIO */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Negocio (LTV, CAC, canal)</h2>
        <CardSinDatos
          icono={TrendingUp}
          titulo="LTV : CAC por canal"
          motivo="Todavía no se guarda de dónde viene cada cliente (profiles.source) ni cuánto gastas en atraerlo (acquisition_spend). Las tablas ya existen, listas para cuando se conecten."
        />
      </section>

      {/* ERRORES */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Errores</h2>
        <CardSinDatos
          icono={AlertTriangle}
          titulo="Errores recientes"
          motivo="La app todavía no guarda los errores que le pasan a los usuarios en una tabla propia. La tabla (error_log) ya existe, lista para conectar los Error Boundaries."
        />
      </section>
    </div>
  );
}
