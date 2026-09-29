// Igual que lib/analitica.ts (contador anónimo del embudo), pero para
// código que corre en el SERVIDOR y no tiene `fetch` a su propio dominio a
// mano de forma cómoda: /auth/callback (el usuario llega por el enlace del
// correo o Google, antes de que exista cualquier página cliente) y el
// webhook de Hotmart. Mismo criterio de privacidad: nunca guarda quién es
// la persona, solo suma 1 al tipo de evento — event_log no tiene columna
// para email ni ningún otro dato identificable.
import { createClient } from '@supabase/supabase-js';
import type { EventoEmbudo } from './analitica';

export async function registrarEventoServidor(tipo: EventoEmbudo) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) return;
    const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
    await admin.from('event_log').insert({ type: tipo });
  } catch {
    // Un fallo acá nunca debe afectar el flujo real (login, pago) — es solo
    // un contador para el panel de administrador.
  }
}
