// Consultas del panel de administración (21-BACKOFFICE). SOLO se usan desde
// Server Components dentro de app/admin/** — el RLS de admin (migración
// 0011) exige profiles.role='admin' para el usuario autenticado que hace la
// consulta; si se llamaran desde el cliente con un usuario normal, RLS
// devolvería cero filas (fail-closed), nunca datos ajenos.
//
// Regla de honestidad del dueño (61/21): nunca se inventa un número. Cuando
// una fuente no existe todavía, la función devuelve `null`/arreglo vacío y
// la pantalla lo rotula "Sin datos", nunca un 0 que parezca real.

import { crearClienteSupabaseServidor } from './supabase/server';

export interface ResumenVentas {
  totalCompras: number;
  porEstado: Record<string, number>;
  ultimaCompra: string | null;
  /** El webhook de Hotmart no guarda el monto del cobro (ver ESTADO.md) —
   * ingresos/MRR son "Sin datos" hasta que se capture. */
  ingresosDisponibles: false;
}

export async function obtenerResumenVentas(): Promise<ResumenVentas> {
  const supabase = await crearClienteSupabaseServidor();
  const { data } = await supabase.from('hotmart_purchases').select('status, updated_at').order('updated_at', { ascending: false });
  const filas = data ?? [];
  const porEstado: Record<string, number> = {};
  for (const f of filas) {
    porEstado[f.status] = (porEstado[f.status] ?? 0) + 1;
  }
  return {
    totalCompras: filas.length,
    porEstado,
    ultimaCompra: filas[0]?.updated_at ?? null,
    ingresosDisponibles: false,
  };
}

export interface ResumenUsuarios {
  total: number;
  porPlan: Record<string, number>;
  altasUltimos7Dias: number;
  altasUltimos30Dias: number;
}

export async function obtenerResumenUsuarios(): Promise<ResumenUsuarios> {
  const supabase = await crearClienteSupabaseServidor();
  const { data } = await supabase.from('profiles').select('plan, created_at');
  const filas = data ?? [];
  const ahora = Date.now();
  const dia = 24 * 60 * 60 * 1000;
  const porPlan: Record<string, number> = {};
  let altas7 = 0;
  let altas30 = 0;
  for (const f of filas) {
    porPlan[f.plan] = (porPlan[f.plan] ?? 0) + 1;
    const edadDias = (ahora - new Date(f.created_at).getTime()) / dia;
    if (edadDias <= 7) altas7++;
    if (edadDias <= 30) altas30++;
  }
  return { total: filas.length, porPlan, altasUltimos7Dias: altas7, altasUltimos30Dias: altas30 };
}

export interface ResumenUso {
  totalSeriesRegistradas: number;
  seriesUltimos7Dias: number;
  usuariosConRegistroUltimos7Dias: number;
  ultimoRegistro: string | null;
}

export async function obtenerResumenUso(): Promise<ResumenUso> {
  const supabase = await crearClienteSupabaseServidor();
  const { data } = await supabase.from('workout_logs').select('user_id, fecha, created_at').order('created_at', { ascending: false });
  const filas = data ?? [];
  const hoy = new Date();
  const hace7 = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recientes = filas.filter((f) => new Date(f.fecha) >= hace7);
  const usuariosUnicos = new Set(recientes.map((f) => f.user_id));
  return {
    totalSeriesRegistradas: filas.length,
    seriesUltimos7Dias: recientes.length,
    usuariosConRegistroUltimos7Dias: usuariosUnicos.size,
    ultimoRegistro: filas[0]?.created_at ?? null,
  };
}

export interface SaludWebhook {
  totalEventos: number;
  ultimoEvento: string | null;
  fallosRecientes: number;
}

export async function obtenerSaludWebhook(): Promise<SaludWebhook> {
  const supabase = await crearClienteSupabaseServidor();
  const { data } = await supabase.from('webhook_log').select('result, received_at').order('received_at', { ascending: false }).limit(50);
  const filas = data ?? [];
  return {
    totalEventos: filas.length,
    ultimoEvento: filas[0]?.received_at ?? null,
    fallosRecientes: filas.filter((f) => f.result === 'error' || f.result === 'unauthorized').length,
  };
}

export interface UsuarioFila {
  id: string;
  email: string | null;
  nombre: string | null;
  plan: string;
  membershipStatus: string | null;
  role: string;
  createdAt: string;
}

export async function buscarUsuarios(query: string): Promise<UsuarioFila[]> {
  const supabase = await crearClienteSupabaseServidor();
  let q = supabase
    .from('profiles')
    .select('id, email, nombre, plan, membership_status, role, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (query.trim()) {
    q = q.ilike('email', `%${query.trim()}%`);
  }
  const { data } = await q;
  return (data ?? []).map((f) => ({
    id: f.id,
    email: f.email,
    nombre: f.nombre,
    plan: f.plan,
    membershipStatus: f.membership_status,
    role: f.role,
    createdAt: f.created_at,
  }));
}

export interface UsuarioCancelado {
  email: string;
  status: string;
  actualizadoEn: string;
}

const ESTADOS_CANCELADO = ['cancelled', 'expired', 'refunded', 'chargeback'];

export interface ResumenChurn {
  total: number;
  ultimos: UsuarioCancelado[];
}

/** Quién canceló (o se le venció/reembolsó/hizo contracargo la membresía) —
 * usa `hotmart_purchases.status` + `updated_at`, la única fuente real de
 * cuándo alguien dejó de pagar (18-VENTA-HOTMART / 58-RETENCION). */
export async function obtenerChurn(): Promise<ResumenChurn> {
  const supabase = await crearClienteSupabaseServidor();
  const { data } = await supabase
    .from('hotmart_purchases')
    .select('email, status, updated_at')
    .in('status', ESTADOS_CANCELADO)
    .order('updated_at', { ascending: false });
  const filas = data ?? [];
  return {
    total: filas.length,
    ultimos: filas.slice(0, 8).map((f) => ({ email: f.email, status: f.status, actualizadoEn: f.updated_at })),
  };
}

export interface PuntoVentasPorSemana {
  semana: string; // "16 jun" — inicio de la semana, para el eje X del gráfico
  compras: number;
}

/** Compras nuevas por semana (últimas 8) — cuenta eventos reales de
 * `first_paid_at`, no inventa ingresos: el webhook no guarda el monto
 * cobrado todavía (ver ResumenVentas.ingresosDisponibles), así que el
 * gráfico muestra VOLUMEN de compras, no dinero. */
export async function obtenerVentasPorSemana(): Promise<PuntoVentasPorSemana[]> {
  const supabase = await crearClienteSupabaseServidor();
  const { data } = await supabase.from('hotmart_purchases').select('first_paid_at').not('first_paid_at', 'is', null);
  const filas = data ?? [];

  const hoy = new Date();
  const semanas: PuntoVentasPorSemana[] = [];
  for (let i = 7; i >= 0; i--) {
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - hoy.getDay() - i * 7);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 7);
    const compras = filas.filter((f) => {
      const t = new Date(f.first_paid_at as string).getTime();
      return t >= inicio.getTime() && t < fin.getTime();
    }).length;
    semanas.push({
      semana: new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(inicio),
      compras,
    });
  }
  return semanas;
}

export interface CostoServicio {
  id: string;
  servicio: string;
  montoMensual: number;
  moneda: string;
  notas: string | null;
}

export interface ResumenCostos {
  servicios: CostoServicio[];
  totalMensualUSD: number;
}

/** Costo real de mantener la app corriendo — lo carga el dueño a mano
 * (Supabase, Vercel, Resend, dominio, comisión de Hotmart, etc.). El total
 * solo suma filas en USD (mezclar monedas sin TRM fija daría un número
 * falso) — si hay una fila en otra moneda, se muestra aparte, no se suma. */
export async function obtenerCostosServicios(): Promise<ResumenCostos> {
  const supabase = await crearClienteSupabaseServidor();
  const { data } = await supabase.from('costos_servicios').select('id, servicio, monto_mensual, moneda, notas').order('monto_mensual', { ascending: false });
  const filas = data ?? [];
  const servicios = filas.map((f) => ({ id: f.id, servicio: f.servicio, montoMensual: Number(f.monto_mensual), moneda: f.moneda, notas: f.notas }));
  const totalMensualUSD = servicios.filter((s) => s.moneda === 'USD').reduce((acc, s) => acc + s.montoMensual, 0);
  return { servicios, totalMensualUSD };
}

export interface ResumenFunnel {
  /** Vistas a la landing en los últimos 30 días — un conteo simple (no
   * visitantes únicos: recargar la página suma otra vista), nunca ligado a
   * una persona. Empieza en 0 el día que se conecta el contador — un 0 acá
   * es un dato real (todavía no se registró ninguna visita), no "sin datos". */
  visitasLanding30d: number;
  /** De los que SÍ se registraron, cuántos siguen en plan gratis (no
   * compraron nunca) — sale de `profiles.plan`, la misma fuente real que ya
   * usa el resto del panel. */
  registrosTotal: number;
  registradosSinComprar: number;
}

/** Los 2 huecos del embudo que pidió el dueño: quién visita y no se
 * registra, y quién se registra y no compra — sin nombres, solo conteos
 * (21-BACKOFFICE / 36-ANALÍTICA). */
export async function obtenerResumenFunnel(): Promise<ResumenFunnel> {
  const supabase = await crearClienteSupabaseServidor();
  const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: visitas }, { data: perfiles }] = await Promise.all([
    supabase.from('event_log').select('id', { count: 'exact', head: true }).eq('type', 'landing_view').gte('created_at', hace30),
    supabase.from('profiles').select('plan'),
  ]);

  const filas = perfiles ?? [];
  const registrosTotal = filas.length;
  const registradosSinComprar = filas.filter((f) => f.plan !== 'pro').length;

  return {
    visitasLanding30d: visitas ?? 0,
    registrosTotal,
    registradosSinComprar,
  };
}

export interface AvisoAdmin {
  tipo: 'aviso' | 'ok';
  mensaje: string;
}

/** Avisos automáticos — solo dispara sobre datos REALES que ya existen hoy
 * (webhook y ventas). Los disparadores de IA/canal/margen del 21 quedan
 * apagados hasta que existan sus fuentes (costo de IA no aplica a esta app,
 * gasto por canal y ganancia conciliada no están instrumentados todavía). */
export async function calcularAvisos(): Promise<AvisoAdmin[]> {
  const salud = await obtenerSaludWebhook();
  const avisos: AvisoAdmin[] = [];

  if (salud.fallosRecientes > 0) {
    avisos.push({
      tipo: 'aviso',
      mensaje: `El webhook de Hotmart tuvo ${salud.fallosRecientes} evento(s) con error en sus últimos 50 registros. Revisa la conexión con Hotmart — un fallo aquí puede significar que un pago no dio acceso.`,
    });
  }
  if (salud.totalEventos === 0) {
    avisos.push({
      tipo: 'aviso',
      mensaje: 'El webhook de Hotmart nunca ha recibido un evento. Si ya vendes, revisa que esté bien configurado en tu panel de Hotmart.',
    });
  }

  if (avisos.length === 0) {
    avisos.push({ tipo: 'ok', mensaje: 'Todo en orden por ahora.' });
  }
  return avisos;
}
