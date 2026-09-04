'use client';

import { useEffect } from 'react';
import { CreditCard, Frown, RefreshCcw, ShieldAlert, Users } from 'lucide-react';
import { registrarEvento } from '@/lib/analitica';
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

// Modelo 2 (onboarding-first, decidido en Sesión 1 — ver ESTADO.md): el CTA
// lleva a /onboarding, nunca al checkout directo desde el hero.
const CTA_HREF = '/onboarding';
const CTA_LABEL = 'Crear mi plan de mañana gratis';

export default function LandingGymEvo() {
  // Contador anónimo de visitas para el panel del dueño (nunca guarda IP ni
  // identifica a nadie — ver app/api/analitica/visita/route.ts). Una vez por
  // carga de página, no por cada re-render.
  useEffect(() => {
    registrarEvento('landing_view');
  }, []);

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      {/* 1. HERO */}
      <Hero
        appName="GymEvo"
        loginHref="/login"
        h1Marked="Nunca más [acento]sin saber[/acento] qué hacer en el gym"
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
        tituloMarked="Tu rutina de hoy, decidida [acento]antes de entrar[/acento]"
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
        <CtaButton href={CTA_HREF}>{CTA_LABEL}</CtaButton>
      </div>

      {/* 5. LA APP POR DENTRO — placeholders honestos (app interna: Sesión 5) */}
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

      {/* 6. OFERTA — anual primero, con trial de 7 días; Mensual es el
          ancla SIN trial (mismo esquema del paywall in-app — nunca prometer
          en la landing algo que el paywall no cumple). */}
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

      {/* 7. GARANTÍA — el trial de 7 días SOLO existe en Semestral/Anual (Mensual
          cobra desde el día 1, a pedido explícito del usuario en el paywall) —
          la garantía de devolución de 7 días desde el cobro sí aplica a los 3
          planes por igual (auditoría legal 04/09/2026: el copy anterior prometía
          "7 días de prueba" como si fuera universal, contradiciendo al Mensual). */}
      <Garantia
        nombre="la Garantía del Primer Plan Claro"
        condicionMarked="Elige Semestral o Anual y entras 7 días gratis, sin que se te cobre nada. ¿Ya pagaste y no sabes qué hacer? Tienes [b]7 días desde tu cobro[/b] para pedir tu dinero de vuelta, en cualquier plan. Sin preguntas."
        pisoLegal="Respaldada por la garantía Hotmart"
      />

      {/* CTA repetido tras la garantía — ya no queda ninguna objeción sin responder */}
      <div className="bg-[var(--surface)] px-5 pb-12 text-center">
        <CtaButton href={CTA_HREF}>{CTA_LABEL}</CtaButton>
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
              'No. El precio que ves es el que pagas. Con Semestral o Anual tienes 7 días gratis antes del primer cobro; con Mensual se cobra desde hoy — en los 3 planes tienes 7 días desde tu cobro para pedir devolución si algo no te convence — [b]sin sorpresas[/b].',
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
        h2Marked="Imagina entrar [acento]sin dudar[/acento] ni un segundo"
        futurePacingMarked="Llegas a tu gimnasio, abres GymEvo, ves tu ejercicio de hoy y empiezas — sin buscar al entrenador, sin improvisar."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        recap="Garantía del Primer Plan Claro · desde 7 días gratis"
        psMarked="PS: GymEvo te dice exactamente qué hacer en el gimnasio, con el Botón de Rescate para cuando la máquina está ocupada. Elige Semestral o Anual y entra gratis 7 días — cualquier plan que elijas queda respaldado por la Garantía del Primer Plan Claro."
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
      <BotonVolverArriba />
    </div>
  );
}
