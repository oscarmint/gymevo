import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — GymEvo",
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] px-5 py-16 md:py-24 [font-family:var(--font-body)] text-[var(--text-primary)]">
      <h1 className="text-[32px] font-bold [font-family:var(--font-display)]">Política de Privacidad</h1>
      <p className="mt-2 text-[14px] text-[var(--text-secondary)]">Última actualización: 28 de agosto de 2026</p>

      <div className="mt-8 flex flex-col gap-6 text-[15px] leading-relaxed">
        <p>
          En GymEvo nos tomamos en serio tu privacidad. Este documento explica qué información
          recogemos, para qué la usamos y qué derechos tienes sobre ella.
        </p>

        <section>
          <h2 className="text-[19px] font-semibold">Qué datos recogemos</h2>
          <ul className="mt-2 list-disc pl-5 flex flex-col gap-1">
            <li>Tu correo electrónico, para crear tu cuenta y enviarte información sobre tu suscripción.</li>
            <li>El nivel que elegiste (Principiante o Intermedio), tu meta (músculo o pérdida de grasa) y tu progreso dentro del plan.</li>
            <li>Tu historial de ejercicios: pesos, series y repeticiones que registras tú mismo.</li>
            <li>Datos de pago: los procesa directamente Hotmart, nuestra plataforma de cobro — GymEvo nunca ve ni almacena el número de tu tarjeta.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[19px] font-semibold">Para qué usamos tus datos</h2>
          <p className="mt-2">
            Únicamente para darte tu plan personalizado, guardar tu progreso entre sesiones y
            comunicarnos contigo sobre tu cuenta (avisos de cobro, cambios en el servicio, soporte).
            Nunca vendemos tus datos a terceros.
          </p>
        </section>

        <section>
          <h2 className="text-[19px] font-semibold">Con quién compartimos datos</h2>
          <p className="mt-2">
            Con Hotmart (procesamiento de pagos) y con nuestro proveedor de base de datos e
            infraestructura (Supabase), únicamente para operar el servicio. No compartimos tu
            información con anunciantes ni la usamos para publicidad de terceros.
          </p>
        </section>

        <section>
          <h2 className="text-[19px] font-semibold">Tus derechos</h2>
          <p className="mt-2">
            Puedes pedirnos en cualquier momento una copia de tus datos o que los eliminemos por
            completo, escribiendo a{" "}
            <a href="mailto:soporte@gymevo.app" className="underline underline-offset-4">
              soporte@gymevo.app
            </a>
            . Respondemos en un máximo de 5 días hábiles.
          </p>
        </section>

        <section>
          <h2 className="text-[19px] font-semibold">Contacto</h2>
          <p className="mt-2">
            Si tienes preguntas sobre esta política, escríbenos a{" "}
            <a href="mailto:soporte@gymevo.app" className="underline underline-offset-4">
              soporte@gymevo.app
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
