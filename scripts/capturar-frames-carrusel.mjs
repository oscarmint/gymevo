// Sesión 7 (re-capturado en Sesión 8 con la identidad oscura "Sala de Pesas")
// — captura los 4 frames REALES del carrusel "La app por dentro" de la
// landing. Salen a public/screenshots/ porque los sirve el navegador del
// visitante, a diferencia de docs/revisiones (evidencia interna del revisor).
// /app y /app/historial exigen sesión paga real (proxy.ts) sin bypass de
// servidor — se capturan vía rutas temporales /dev-preview-plandeldia y
// /dev-preview-historial (mismo componente, sin el guard), creadas justo
// antes de correr este script y borradas justo después.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const OUT_DIR = 'public/screenshots';
mkdirSync(OUT_DIR, { recursive: true });

const RESPUESTAS_ONBOARDING = {
  sexo: 'hombre',
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
  sexo: 'hombre',
  diaActual: 12,
  racha: 6,
  ultimaFecha: HOY,
  hechosHoy: ['hip_thrust_barra'],
  reemplazosHoy: {},
  // ids reales del catálogo actual (Sesión 8, "REAL FISIC") — con ids viejos
  // ya retirados, Historial cae al respaldo "Ejercicio anterior" para los 3,
  // que se ve como un catálogo roto en el screenshot de la landing.
  logs: [
    { fecha: ANTEAYER, ejercicioId: 'press_banco_mancuernas', peso: 38, reps: 8, series: 4 },
    { fecha: AYER, ejercicioId: 'sentadilla_barra', peso: 55, reps: 8, series: 4 },
    { fecha: AYER, ejercicioId: 'jalon_pecho', peso: 40, reps: 10, series: 3 },
    { fecha: HOY, ejercicioId: 'hip_thrust_barra', peso: 45, reps: 10, series: 3 },
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
  await page.getByText('Hombre', { exact: true }).click();
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
  // El label de este frame es sobre el Botón de Rescate — vive debajo de los
  // 7 ejercicios del Día 1, hay que desplazarse para que quede en cuadro.
  await page.getByText('¿Máquina ocupada?').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT_DIR}/frame-rescate.png` });
  await page.close();
  console.log('✓ frame-rescate.png');
}

// 3) Plan del día — /app exige sesión paga real (proxy.ts); se usa la ruta
// temporal /dev-preview-plandeldia (mismo componente, sin el guard), borrada
// en cuanto termina esta captura.
{
  const page = await nuevaPagina();
  await page.goto(`${BASE}/dev-preview-plandeldia`);
  await page.evaluate(
    ({ r, p }) => {
      sessionStorage.setItem('gymevo_onboarding', JSON.stringify(r));
      localStorage.setItem('gymevo_progreso', JSON.stringify(p));
      // Salta el saludo previo al entrenamiento ("Iniciar entrenamiento") —
      // el carrusel de la landing quiere el plan ya cargado, no el ritual.
      sessionStorage.setItem('gymevo_saludo_visto', new Date().toISOString().slice(0, 10));
    },
    { r: RESPUESTAS_ONBOARDING, p: PROGRESO_APP },
  );
  await page.goto(`${BASE}/dev-preview-plandeldia`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT_DIR}/frame-plan-del-dia.png` });
  await page.close();
  console.log('✓ frame-plan-del-dia.png');
}

// 4) Historial de pesos — misma razón que arriba: ruta temporal sin guard.
{
  const page = await nuevaPagina();
  await page.goto(`${BASE}/dev-preview-historial`);
  await page.evaluate((p) => localStorage.setItem('gymevo_progreso', JSON.stringify(p)), PROGRESO_APP);
  await page.goto(`${BASE}/dev-preview-historial`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT_DIR}/frame-historial.png` });
  await page.close();
  console.log('✓ frame-historial.png');
}

await browser.close();
