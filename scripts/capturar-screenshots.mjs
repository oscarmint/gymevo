// Sesión 7 — captura screenshots reales a 375px para el subagente revisor-visual.
// Uso puntual (no forma parte del build): node scripts/capturar-screenshots.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const OUT_DIR = 'docs/revisiones';
mkdirSync(OUT_DIR, { recursive: true });

const RESPUESTAS_ONBOARDING = {
  nivel: 'principiante',
  meta: 'musculo',
  frustracion: 'maquinas',
  horario: 'tarde',
  diasSemana: 4,
};

const AYER = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const HOY = new Date().toISOString().slice(0, 10);

// Día 12 = tipo 'full' (remo_un_brazo, press_hombros_mancuerna, plancha) —
// se marca uno como hecho HOY para que el tachado (dispositivo ownable) sea
// verificable y la racha NO esté en riesgo (caso feliz de la pantalla M0).
const PROGRESO_APP = {
  diaActual: 12,
  racha: 6,
  ultimaFecha: HOY,
  hechosHoy: ['remo_un_brazo'],
  reemplazosHoy: {},
  logs: [
    { fecha: AYER, ejercicioId: 'press_banca', peso: 40, reps: 8, series: 4 },
    { fecha: HOY, ejercicioId: 'remo_un_brazo', peso: 18, reps: 10, series: 3 },
  ],
  descansoAutomatico: true,
};

const browser = await chromium.launch();

async function shot(nombre, url, { seedFn, seedData, fullPage = true, scrollThrough = false } = {}) {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  if (seedFn) {
    await page.goto(url);
    await page.evaluate(seedFn, seedData);
  }
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900); // dejar terminar animaciones de entrada

  if (scrollThrough) {
    // Las secciones usan whileInView (framer-motion): sin scroll real, el
    // IntersectionObserver nunca dispara y el fullPage sale con todo en blanco.
    const alto = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < alto; y += 400) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(120);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
  }

  await page.screenshot({ path: `${OUT_DIR}/${nombre}-375.png`, fullPage });
  await page.close();
  console.log(`✓ ${nombre}-375.png`);
}

await shot('landing', `${BASE}/`, { scrollThrough: true });

await shot('onboarding', `${BASE}/onboarding`);

await shot('paywall', `${BASE}/paywall`, {
  seedFn: (r) => sessionStorage.setItem('gymevo_onboarding', JSON.stringify(r)),
  seedData: RESPUESTAS_ONBOARDING,
});

await shot('pantalla-principal', `${BASE}/app`, {
  seedFn: ({ r, p }) => {
    sessionStorage.setItem('gymevo_onboarding', JSON.stringify(r));
    localStorage.setItem('gymevo_progreso', JSON.stringify(p));
  },
  seedData: { r: RESPUESTAS_ONBOARDING, p: PROGRESO_APP },
  fullPage: false, // tiene un tab bar fixed abajo; a viewport ya se ve completa
});

await browser.close();
