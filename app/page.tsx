'use client';

import { CreditCard, Frown, RefreshCcw, ShieldAlert, Users } from 'lucide-react';
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
import { CtaButton, StickyCtaMobile } from '@/components/landing/ui';

// Modelo 2 (onboarding-first, decidido en Sesión 1 — ver ESTADO.md): el CTA
// lleva a /onboarding, nunca al checkout directo desde el hero.
const CTA_HREF = '/onboarding';
const CTA_LABEL = 'Crear mi plan de mañana gratis';

export default function LandingGymEvo() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      {/* 1. HERO */}
      <Hero
        appName="GymEvo"
        loginHref="/login"
        h1Marked="Nunca más [acento]sin saber qué hacer[/acento] en el gym"
        subtitleMarked="El Botón de Rescate te da otro ejercicio [b]al instante[/b] sin pensar ni improvisar"
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

      {/* 2. PROBLEMA */}
      <Problema
        titulo="¿Te suena?"
        preguntas={[
          { icon: ShieldAlert, textoMarked: '¿Te da miedo [b]lesionarte[/b] por no saber la técnica?' },
          { icon: Users, textoMarked: '¿Los entrenadores de tu gimnasio están más pendientes de comadrear?' },
          { icon: RefreshCcw, textoMarked: '¿Una app de IA te cambia la rutina cada día?' },
          { icon: Frown, textoMarked: '¿Te da vergüenza quedarte parado sin saber qué hacer?' },
          { icon: CreditCard, textoMarked: '¿Te preocupa que te claven una suscripción con cobros ocultos?' },
        ]}
      />

      {/* 3. AGITACIÓN */}
      <Agitacion
        frases={[
          'Llevas meses pagando la mensualidad y en el espejo [b]te ves exactamente igual[/b].',
          'Cada semana sin plan es una semana de [acento]entrenar sin estrategia[/acento], y el cuerpo no cambia solo.',
          'Si sigues improvisando, en 6 meses vas a seguir en el mismo punto — con 6 meses menos.',
        ]}
        contraste={{
          labelHoy: 'Hoy',
          hoy: 'Entras al gym, ves todo ocupado, y terminas 20 minutos en la caminadora.',
          labelFuturo: 'En 6 meses, si nada cambia',
          futuro: 'El mismo cuerpo, la misma frustración — con 6 meses menos.',
        }}
      />

      {/* 4. SOLUCIÓN — el Botón de Rescate */}
      <Solucion
        tituloMarked="Tu rutina de hoy, [acento]decidida antes de entrar[/acento]"
        mecanismo="el Botón de Rescate"
        bigIdeaMarked="No te falta disciplina, te falta un plan que no te abandone en el gimnasio. El Botón de Rescate te da [b]otro ejercicio al instante[/b] si el tuyo está ocupado."
        pasos={[
          { titulo: 'Eliges tu ruta', detalle: 'Principiante (90 días) o Intermedio, según tu nivel.' },
          { titulo: 'Ves tu plan de hoy', detalle: 'El ejercicio exacto, series, peso y descanso.' },
          { titulo: 'Tocas Rescate si hace falta', detalle: '¿Máquina ocupada? Otro ejercicio al instante.' },
        ]}
        antesDespues={{
          labelAntes: 'Antes',
          antes: 'Parado frente a la máquina, sin saber qué hacer.',
          labelDespues: 'Después',
          despues: 'Ejecutas tu plan sin pensar, con alternativa siempre lista.',
        }}
      />

      {/* CTA repetido tras el mecanismo — para quien ya está convencido no tiene que buscar el botón.
          pb corto: AppPorDentro (SectionShell) ya trae su propio pt-16/24; sumar ambos dejaba
          ~110-140px de vacío muerto entre el botón y el siguiente título (hallazgo revisor-visual). */}
      <div className="bg-[var(--bg)] px-5 pb-4 text-center">
        <CtaButton href={CTA_HREF} fullMobile={false}>
          {CTA_LABEL}
        </CtaButton>
      </div>

      {/* 5. LA APP POR DENTRO — placeholders honestos (app interna: Sesión 5) */}
      <AppPorDentro
        tituloMarked="Tu gimnasio, [acento]por fin bajo control[/acento]"
        frames={[
          { label: 'Eliges tu nivel y tu meta', src: '/screenshots/frame-onboarding.png', alt: 'Onboarding: elige tu meta' },
          { label: 'Tu ejercicio de hoy, listo', src: '/screenshots/frame-plan-del-dia.png', alt: 'Plan del día con ejercicios y racha' },
          { label: '¿Ocupada? Cambias al instante', src: '/screenshots/frame-rescate.png', alt: 'Botón de Rescate en tu plan del Día 1' },
          { label: 'Ves tu progreso real', src: '/screenshots/frame-historial.png', alt: 'Historial de pesos registrados' },
        ]}
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
      />

      {/* 6. OFERTA — anual primero, trial 7 días en ambas (02C) */}
      <Oferta
        tituloMarked="Empieza gratis. Sigue por [acento]menos de $0.09/día[/acento]"
        trialDias={7}
        stack={{
          lineas: [
            { resultado: 'GymEvo Pro con el Botón de Rescate (12 meses)', valor: '$60' },
            { resultado: 'Ruta Intermedio completa anti-estancamiento', valor: '$29' },
            { resultado: 'Guía de nutrición sin fórmulas complicadas', valor: '$19' },
          ],
          totalTachado: '$108',
          nota: 'Hoy: $2.50/mes (se cobra $29.99/año)',
        }}
        anual={{
          nombre: 'Anual',
          badge: 'MÁS POPULAR',
          precioMes: '$2.50',
          totalAnual: 'Se cobra $29.99/año',
          ahorro: '6 meses gratis',
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
          ctaLabel: 'Elegir mensual',
          ctaHref: CTA_HREF,
          features: [
            'Tu plan de hoy, listo cada día',
            'Botón de Rescate ilimitado',
            'Registro de pesos y progreso',
            'Cancelas cuando quieras',
          ],
        }}
      />

      {/* 7. GARANTÍA — 7 días de prueba sin cobro + 7 días más de devolución tras el cobro (FICHA-MERCADO.md: 14 > 7) */}
      <Garantia
        nombre="la Garantía del Primer Plan Claro"
        condicionMarked="7 días de prueba sin que se te cobre nada. Si igual pagas y no sabes qué hacer, tienes [b]7 días más[/b] para pedir tu dinero de vuelta. Sin preguntas."
        pisoLegal="Respaldada por la garantía Hotmart"
      />

      {/* CTA repetido tras la garantía — ya no queda ninguna objeción sin responder */}
      <div className="bg-[var(--surface)] px-5 pb-12 text-center">
        <CtaButton href={CTA_HREF} fullMobile={false}>
          {CTA_LABEL}
        </CtaButton>
      </div>

      {/* 8. FAQ */}
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
              'No. El precio que ves es el que pagas, y tienes 7 días gratis antes de que se cobre nada — [b]sin sorpresas[/b].',
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

      {/* 9. CTA FINAL */}
      <CtaFinal
        h2Marked="Imagina entrar [acento]sin dudar ni un segundo[/acento]"
        futurePacingMarked="Llegas a tu gimnasio, abres GymEvo, ves tu ejercicio de hoy y empiezas — sin buscar al entrenador, sin improvisar."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        recap="Garantía del Primer Plan Claro · 7 días gratis"
        psMarked="PS: GymEvo te dice exactamente qué hacer en el gimnasio, con el Botón de Rescate para cuando la máquina está ocupada. Hoy entras con 7 días gratis y la Garantía del Primer Plan Claro."
      />

      {/* 10. FOOTER LEGAL */}
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
    </div>
  );
}
