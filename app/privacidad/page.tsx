import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Política de Privacidad — GymEvo",
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-16 md:py-24 [font-family:var(--font-body)] text-[var(--text-primary)]">
      <Link href="/" className="mb-10 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
        <Logo className="size-9 text-[var(--accent)]" />
        GymEvo
      </Link>

      <h1 className="text-4xl font-bold [font-family:var(--font-display)]">Política de Privacidad</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Última actualización: 4 de septiembre de 2026 (versión 2)</p>

      <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed">
        <p>
          En GymEvo nos tomamos en serio tu privacidad. Este documento explica qué información
          recogemos, para qué la usamos, con quién la compartimos y qué derechos tienes sobre ella.
        </p>

        <section>
          <h2 className="text-lg font-semibold">Quién es el responsable de tus datos</h2>
          <p className="mt-2">
            GymEvo es operado por <strong>Oscar Hernán Hernández Murillo</strong>, persona natural, con domicilio en
            Colombia. Puedes contactarnos para cualquier tema de privacidad en{" "}
            <a href="mailto:soporte@gymevo.app" className="underline underline-offset-4">
              soporte@gymevo.app
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Qué datos recogemos</h2>
          <ul className="mt-2 list-disc pl-5 flex flex-col gap-1">
            <li>Tu correo electrónico, para crear tu cuenta y enviarte información sobre tu suscripción.</li>
            <li>El nivel que elegiste (Principiante o Intermedio), tu meta (músculo o pérdida de grasa) y tu progreso dentro del plan.</li>
            <li>Tu historial de ejercicios: pesos, series y repeticiones que registras tú mismo.</li>
            <li>Datos corporales que ingresas voluntariamente para calcular tus macros (peso, estatura, edad, cintura) — nunca obligatorios para usar la app.</li>
            <li>Tu nombre y, si decides subirla, una foto de perfil (desde tu cámara o galería).</li>
            <li>
              Si activas los recordatorios de entrenamiento, la suscripción técnica de notificaciones de tu
              navegador (un identificador de tu dispositivo, no tu ubicación ni datos personales adicionales).
            </li>
            <li>Datos de pago: los procesa directamente Hotmart, nuestra plataforma de cobro — GymEvo nunca ve ni almacena el número de tu tarjeta.</li>
          </ul>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            GymEvo no usa inteligencia artificial para generar tu plan ni para procesar lo que escribes:
            tus rutinas y cálculos de macros siguen fórmulas fijas que diseñamos nosotros. Por eso tus datos
            no se envían a ningún proveedor de IA.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Para qué usamos tus datos</h2>
          <p className="mt-2">
            Únicamente para darte tu plan personalizado, guardar tu progreso entre sesiones, avisarte si
            llevas un par de días sin entrenar (solo si tú activaste esa opción) y comunicarnos contigo
            sobre tu cuenta (avisos de cobro, cambios en el servicio, soporte). Nunca vendemos tus datos a
            terceros ni los usamos para publicidad.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Con quién compartimos datos</h2>
          <p className="mt-2">Compartimos datos únicamente con los proveedores que necesitamos para operar el servicio:</p>
          <ul className="mt-2 list-disc pl-5 flex flex-col gap-1">
            <li><strong>Hotmart</strong> — procesa tu pago y tu suscripción.</li>
            <li><strong>Supabase</strong> — guarda tu cuenta, tu progreso y tu foto de perfil (base de datos, autenticación y almacenamiento de archivos).</li>
            <li><strong>Vercel</strong> — aloja y sirve la aplicación web.</li>
            <li><strong>Resend</strong> — envía los correos de tu cuenta (enlace de acceso, avisos de cobro).</li>
          </ul>
          <p className="mt-2">
            No compartimos tu información con anunciantes ni la usamos para publicidad de terceros. GymEvo
            no usa cookies de rastreo ni píxeles publicitarios de ningún tipo.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Dónde se guardan tus datos (transferencia internacional)</h2>
          <p className="mt-2">
            Supabase, Vercel y Resend operan con infraestructura fuera de Colombia (principalmente en
            Estados Unidos). Esto significa que tus datos viajan y se almacenan en esos países mientras te
            damos el servicio. Estos proveedores se comprometen contractualmente a proteger tu información
            bajo estándares equivalentes a los de la ley colombiana. Al usar GymEvo autorizas esta
            transferencia, necesaria para que la app funcione.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Base legal y autorización (Colombia — Ley 1581 de 2012)</h2>
          <p className="mt-2">
            Tratamos tus datos con tu <strong>autorización previa, expresa e informada</strong>, que otorgas
            al marcar la casilla de aceptación antes de crear tu cuenta. Puedes retirar esa autorización en
            cualquier momento escribiéndonos, sin que eso afecte los tratamientos ya realizados legalmente.
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            GymEvo, por su tamaño actual, no supera el umbral de activos que exige inscribirse en el
            Registro Nacional de Bases de Datos (RNBD) de la SIC. Revisamos esta condición periódicamente a
            medida que el negocio crece.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Tus derechos</h2>
          <p className="mt-2">
            Como titular de tus datos tienes derecho a conocerlos, actualizarlos, rectificarlos, pedir
            prueba de tu autorización, solicitar su eliminación y revocar la autorización que nos diste.
            Para ejercerlos, escríbenos a{" "}
            <a href="mailto:soporte@gymevo.app" className="underline underline-offset-4">
              soporte@gymevo.app
            </a>
            . Respondemos en un máximo de 5 días hábiles (15 días hábiles si tu solicitud es una queja
            formal, según el plazo legal).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Cómo eliminar tu cuenta</h2>
          <p className="mt-2">
            Desde tu Perfil dentro de la app puedes eliminar tu cuenta con un botón directo. Al hacerlo
            borramos tu perfil, tu historial de entrenamientos, tu foto y tus suscripciones a
            notificaciones — de inmediato y sin necesidad de escribirnos. La única excepción es el registro
            de tu compra en Hotmart (correo, fechas y estado de la suscripción), que conservamos porque la
            ley nos obliga a llevar contabilidad de nuestros ingresos; nunca lo usamos para otra cosa.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Cambios a esta política</h2>
          <p className="mt-2">
            Si hacemos un cambio importante en cómo tratamos tus datos, te avisamos por correo antes de que
            entre en vigor — nunca lo cambiamos en silencio. La fecha de arriba siempre indica la versión
            vigente.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Contacto</h2>
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
