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
