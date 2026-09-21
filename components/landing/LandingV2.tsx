'use client';

// LANDING V2 — A/B contra LandingV1.tsx (12/09/2026, a pedido explícito del
// usuario). Ángulo DISTINTO, misma identidad visual/estructura/precio/oferta
// (una sola variable a probar: el mensaje). Trazado a FICHA-AVATAR.md:
// - Dolor #1 ★ "Me da terror hacer mal un ejercicio, dañar mi espalda..."
// - Dolor #5 (identidad) "Siento que solo voy al gimnasio a improvisar..."
// - Deseo #5 (identidad) "Quiero entrar con la autoridad de un experto,
//   no sentirme juzgado por nadie"
// V1 lidera con el MECANISMO (Botón de Rescate); V2 lidera con el MIEDO A LA
// MALA TÉCNICA + la identidad de "dejar de improvisar" — el resto de la
// oferta (precio, garantía, FAQ, capturas) es IDÉNTICO a propósito.

import { Logo } from '@/components/Logo';
import { Hero } from '@/components/landing/Hero';
import { Problema } from '@/components/landing/Problema';
import { Agitacion } from '@/components/landing/Agitacion';
import { Solucion } from '@/components/landing/Solucion';
import { AppPorDentro } from '@/components/landing/AppPorDentro';
import { Oferta } from '@/components/landing/Oferta';
import { Garantia } from '@/components/landing/Garantia';
import { Faq } from '@/components/landing/Faq';
import { CtaFinal } from '@/components/landing/CtaFinal';
import { FooterLegal } from '@/components/landing/FooterLegal';
import { BotonVolverArriba, CtaButton, StickyCtaMobile } from '@/components/landing/ui';
import { CreditCard, Frown, RefreshCcw, ShieldAlert, Users } from 'lucide-react';

const CTA_HREF = '/onboarding';
const CTA_LABEL = 'Crear mi plan de mañana gratis';

export default function LandingV2() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      {/* 1. HERO — ángulo: miedo a la mala técnica + dejar de improvisar */}
      <Hero
        appName="GymEvo"
        loginHref="/login"
        h1Marked="Deja de [acento]entrenar a ciegas[/acento] con miedo a lesionarte"
        subtitleMarked="Un plan exacto, con la técnica correcta — [b]sin improvisar[/b] ni arriesgar tu espalda"
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        socialProof={<span>Garantía Hotmart de 7 días — sin preguntas</span>}
        visual={
          // eslint-disable-next-line @next/next/no-img-element -- Hero.tsx del kit usa <img> a propósito (portable, ver su comentario)
          <img
            src="/screenshots/frame-plan-del-dia.png"
            alt="Plan del día en GymEvo: ejercicios de hoy, racha y Botón de Rescate"
            className="w-full"
          />
        }
        backgroundVideoSrc="/videos/hero-gimnasio.mp4"
      />

      {/* 2. PROBLEMA — mismo set de preguntas de V1, orden por prioridad
          invertido: aquí el miedo a la técnica va primero (encabeza el ángulo). */}
      <Problema
        titulo="¿Te suena?"
        preguntas={[
          { icon: ShieldAlert, textoMarked: '¿Te da miedo [b]lesionarte[/b] por no saber la técnica?' },
          { icon: Frown, textoMarked: '¿Sientes que solo vas a "cumplir" sin saber si estás progresando?' },
          { icon: Users, textoMarked: '¿Los entrenadores de tu gimnasio están más pendientes de comadrear?' },
          { icon: RefreshCcw, textoMarked: '¿Una app de IA te cambia la rutina y no aprendes nada?' },
          { icon: CreditCard, textoMarked: '¿Te preocupa que te claven una suscripción con cobros ocultos?' },
        ]}
      />

      {/* 3. AGITACIÓN — el riesgo real (lesión), no solo tiempo perdido */}
      <Agitacion
        frases={[
          'Llevas meses yendo "a ciegas" y sigues sin saber si haces bien cada ejercicio.',
          'Cada serie mal hecha sin saberlo es un [acento]riesgo real[/acento] para tu espalda, no solo tiempo perdido.',
          'Si sigues improvisando, en 6 meses vas a seguir en el mismo punto, con más miedo.',
        ]}
        contraste={{
          labelHoy: 'Hoy',
          hoy: 'Entras al gym sin saber si tu técnica es correcta, con miedo a lastimarte.',
          labelFuturo: 'En 6 meses, si nada cambia',
          futuro: 'La misma duda, el mismo miedo — con 6 meses menos.',
        }}
      />

      {/* 4. SOLUCIÓN — mismo mecanismo (Botón de Rescate), pero encuadrado
          como "saber qué hacer y cómo hacerlo bien", no como plan B de máquina ocupada. */}
      <Solucion
        tituloMarked="Entra sabiendo [acento]exactamente qué hacer[/acento] en el gimnasio"
        mecanismo="tu plan de hoy"
        bigIdeaMarked="No te falta disciplina, te falta saber qué hacer bien. Tu plan de hoy trae el ejercicio exacto, y el [b]Botón de Rescate[/b] resuelve la máquina ocupada."
        pasos={[
          { titulo: 'Eliges tu ruta', detalle: 'Principiante (90 días) o Intermedio, según tu nivel.' },
          { titulo: 'Ves tu plan de hoy', detalle: 'El ejercicio exacto, series, peso y descanso.' },
          { titulo: 'Ejecutas con confianza', detalle: '¿Máquina ocupada? Otro ejercicio al instante, nunca a ciegas.' },
        ]}
        antesDespues={{
          labelAntes: 'Antes',
          antes: 'Parado frente a la máquina, sin saber si lo estás haciendo bien.',
          labelDespues: 'Después',
          despues: 'Ejecutas tu plan con la confianza de saber que vas por buen camino.',
        }}
      />

      <div className="bg-[var(--bg)] px-5 pb-4 text-center">
        <CtaButton href={CTA_HREF}>{CTA_LABEL}</CtaButton>
      </div>

      {/* 5. LA APP POR DENTRO — idéntico a V1 (no es parte del ángulo a probar) */}
      <AppPorDentro
        tituloMarked="Tu gimnasio, por fin [acento]bajo control[/acento]"
        frames={[
          { label: 'Eliges tu nivel y tu meta', src: '/screenshots/frame-onboarding.png', alt: 'Onboarding: elige tu meta' },
          { label: 'Tu ejercicio de hoy, listo', src: '/screenshots/frame-plan-del-dia.png', alt: 'Plan del día con ejercicios y racha' },
          { label: '¿Ocupada? Cambias al instante', src: '/screenshots/frame-rescate.png', alt: 'Botón de Rescate en tu plan del Día 1' },
          { label: 'Ves tu progreso real', src: '/screenshots/frame-historial.png', alt: 'Historial de pesos registrados' },
        ]}
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
      />

      {/* 6. OFERTA — idéntica a V1 (precio y estructura no son parte del experimento) */}
      <Oferta
        tituloMarked="Empieza gratis. Sigue por menos de [acento]$0.09/día[/acento]"
        stack={{
          lineas: [
            { resultado: 'GymEvo Pro con el Botón de Rescate (12 meses)', valor: '$60 USD' },
            { resultado: 'Ruta Intermedio completa anti-estancamiento', valor: '$29 USD' },
            { resultado: 'Guía de nutrición sin fórmulas complicadas', valor: '$19 USD' },
          ],
          totalTachado: '$108 USD',
          nota: 'Hoy: $2.50 USD/mes (se cobra $29.99 USD/año)',
        }}
        anual={{
          nombre: 'Anual',
          badge: 'MÁS POPULAR',
          precioMes: '$2.50',
          trialDias: 7,
          totalAnual: 'Se cobra $29.99 USD/año',
          ahorro: 'Ahorra 50%',
          descomposicionDia: 'menos de $0.09 al día',
          ctaLabel: 'Empezar mis 7 días gratis',
          ctaHref: CTA_HREF,
          features: [
            'Tu plan de hoy, listo (Principiante o Intermedio)',
            'Botón de Rescate ilimitado',
            'Registro de pesos y progreso',
            'Ruta Intermedio para romper el estancamiento',
          ],
        }}
        mensual={{
          nombre: 'Mensual',
          precioMes: '$4.99',
          trialDias: 3,
          ctaLabel: 'Empezar mis 3 días gratis',
          ctaHref: CTA_HREF,
          features: [
            'Tu plan de hoy, listo cada día',
            'Botón de Rescate ilimitado',
            'Registro de pesos y progreso',
            'Cancelas cuando quieras',
          ],
        }}
      />

      {/* 7. GARANTÍA — idéntica a V1 */}
      <Garantia
        nombre="la Garantía del Primer Plan Claro"
        condicionMarked="Pruébalo gratis: 7 días en Anual y Semestral, 3 días en Mensual, sin que se te cobre nada. Y si ya pagaste y no te convence, tienes [b]7 días desde tu cobro[/b] para pedir tu dinero de vuelta, en cualquier plan. Sin preguntas."
        pisoLegal="Respaldada por la garantía Hotmart"
      />

      <div className="bg-[var(--surface)] px-5 pb-12 text-center">
        <CtaButton href={CTA_HREF}>{CTA_LABEL}</CtaButton>
      </div>

      {/* 8. FAQ — idéntica a V1 */}
      <Faq
        items={[
          {
            pregunta: '¿Esto de verdad me enseña a entrenar, o es un PDF con dibujitos?',
            respuestaMarked:
              'No: cada día ves el ejercicio exacto con ilustración simple, series, peso y descanso — [b]nada que armar tú mismo[/b].',
          },
          {
            pregunta: '¿Qué pasa si mi gimnasio no tiene la máquina o está siempre llena?',
            respuestaMarked:
              'Tocas el Botón de Rescate y te damos otro ejercicio equivalente al instante, con peso libre incluido.',
          },
          {
            pregunta: '¿Me van a cobrar algo oculto la próxima tarjeta?',
            respuestaMarked:
              'No. El precio que ves es el que pagas. Tienes 7 días gratis antes del primer cobro en Anual y Semestral (3 días en Mensual), y en los 3 planes 7 días desde tu cobro para pedir devolución si algo no te convence — [b]sin sorpresas[/b].',
          },
          {
            pregunta: '¿Y qué pasa después de los 90 días de la Ruta Principiante?',
            respuestaMarked:
              'Pasas a la Ruta Intermedio, con rutinas de progresión para seguir avanzando y romper el estancamiento.',
          },
          {
            pregunta: '¿Por qué no uso una app de IA gratis?',
            respuestaMarked:
              'Porque esas te cambian la rutina cada día y no aprendes nada. Aquí el plan [b]no se mueve sin razón[/b] — así sí progresas.',
          },
        ]}
      />

      {/* 9. CTA FINAL — reforzando el ángulo de confianza/técnica */}
      <CtaFinal
        h2Marked="Imagina entrar [acento]sin miedo a hacerlo mal[/acento]"
        futurePacingMarked="Llegas a tu gimnasio, abres GymEvo, ves tu ejercicio de hoy y ejecutas con la técnica correcta — sin adivinar, sin miedo, sin vergüenza."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        recap="Garantía del Primer Plan Claro · desde 7 días gratis"
        psMarked="PS: GymEvo te dice exactamente qué hacer y cómo hacerlo bien en el gimnasio, con el Botón de Rescate para cuando la máquina está ocupada. Empieza gratis: 7 días en Anual o Semestral, 3 en Mensual — cualquier plan que elijas queda respaldado por la Garantía del Primer Plan Claro."
      />

      {/* 10. FOOTER LEGAL — idéntico a V1 */}
      <FooterLegal
        appName="GymEvo"
        logo={<Logo className="size-5 text-[var(--accent)]" />}
        soporteEmail="soporte@gymevo.app"
        enlaces={[
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos y Condiciones', href: '/terminos' },
          { label: 'Reembolsos', href: '/reembolsos' },
        ]}
      />

      <StickyCtaMobile labelComercial={CTA_LABEL} href={CTA_HREF} />
      <BotonVolverArriba />
    </div>
  );
}
