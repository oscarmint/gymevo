// Contador anónimo de visitas a la landing — para el panel de administrador
// (21-BACKOFFICE / 36-ANALÍTICA): "cuántos visitan y no se registran". Nunca
// guarda IP, user-agent, ni ningún dato que identifique a la persona — solo
// suma 1 al total, coherente con lo que la Política de Privacidad promete
// ("GymEvo no usa cookies de rastreo ni píxeles publicitarios"). Usa la
// llave de servidor porque un visitante anónimo no tiene sesión — event_log
// no permite insertar sin ella (a propósito, ver migración 0011).
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function clienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('FALTA NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) throw new Error('FALTA SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

export async function POST() {
  try {
    const admin = clienteAdmin();
    await admin.from('event_log').insert({ type: 'landing_view' });
  } catch {
    // Un fallo acá nunca debe afectar al visitante real — es solo un contador.
  }
  return NextResponse.json({ ok: true });
}
