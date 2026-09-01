// Sesión 7 — captura los 4 frames REALES del carrusel "La app por dentro" de
// la landing (antes eran placeholders grises). Salen a public/screenshots/
// porque los sirve el navegador del visitante, a diferencia de docs/revisiones
// (que es evidencia interna para el revisor). Requiere GYMEVO_SKIP_AUTH_GUARD=1
// en el server para las rutas de /app (ver proxy.ts).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const OUT_DIR = 'public/screenshots';
mkdirSync(OUT_DIR, { recursive: true });

const RESPUESTAS_ONBOARDING = {
  nivel: 'principiante',
  meta: 'musculo',
  frustracion: 'maquinas',
  horario: 'tarde',
  diasSemana: 4,
};

const HOY = new Date().toISOString().slice(0, 10);
const AYER = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const ANTEAYER = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);

const PROGRESO_APP = {
  diaActual: 12,
  racha: 6,
  ultimaFecha: HOY,
  hechosHoy: ['remo_un_brazo'],
  reemplazosHoy: {},
  logs: [
    { fecha: ANTEAYER, ejercicioId: 'press_banca', peso: 38, reps: 8, series: 4 },
    { fecha: AYER, ejercicioId: 'sentadilla', peso: 55, reps: 8, series: 4 },
    { fecha: AYER, ejercicioId: 'peso_muerto_rumano', peso: 40, reps: 10, series: 3 },
    { fecha: HOY, ejercicioId: 'remo_un_brazo', peso: 18, reps: 10, series: 3 },
  ],
  descansoAutomatico: true,
};

const browser = await chromium.launch();

async function nuevaPagina() {
  return browser.newPage({ viewport: { width: 375, height: 812 } });
}

// 1) Onboarding — paso "frustración" (más rico visualmente: íconos + chips)
{
  const page = await nuevaPagina();
  await page.goto(`${BASE}/onboarding`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.getByText('Recién empiezo, no sé qué hacer').click();
  await page.waitForTimeout(500);
  await page.getByText('Ganar músculo').click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT_DIR}/frame-onboarding.png` });
  await page.close();
  console.log('✓ frame-onboarding.png');
}

// 2) Botón de Rescate — la vista previa del Día 1 lo destaca explícitamente
{
  const page = await nuevaPagina();
  await page.goto(`${BASE}/onboarding/plan`);
  await page.evaluate((r) => sessionStorage.setItem('gymevo_onboarding', JSON.stringify(r)), RESPUESTAS_ONBOARDING);
  await page.goto(`${BASE}/onboarding/plan`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT_DIR}/frame-rescate.png` });
  await page.close();
  console.log('✓ frame-rescate.png');
}

// 3) Plan del día (requiere sesión — GYMEVO_SKIP_AUTH_GUARD=1 en el server)
{
  const page = await nuevaPagina();
  await page.goto(`${BASE}/app`);
  await page.evaluate(
    ({ r, p }) => {
      sessionStorage.setItem('gymevo_onboarding', JSON.stringify(r));
      localStorage.setItem('gymevo_progreso', JSON.stringify(p));
    },
    { r: RESPUESTAS_ONBOARDING, p: PROGRESO_APP },
  );
  await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT_DIR}/frame-plan-del-dia.png` });
  await page.close();
  console.log('✓ frame-plan-del-dia.png');
}

// 4) Historial de pesos (requiere sesión)
{
  const page = await nuevaPagina();
  await page.goto(`${BASE}/app/historial`);
  await page.evaluate((p) => localStorage.setItem('gymevo_progreso', JSON.stringify(p)), PROGRESO_APP);
  await page.goto(`${BASE}/app/historial`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT_DIR}/frame-historial.png` });
  await page.close();
  console.log('✓ frame-historial.png');
}

await browser.close();
