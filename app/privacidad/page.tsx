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
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Última actualización: 26 de septiembre de 2026 (versión 3)</p>

      <div className="prosa-legal mt-8 flex flex-col gap-6 text-base leading-relaxed">
        <p>
          En GymEvo nos tomamos en serio tu privacidad. Este documento explica qué información
          recogemos, para qué la usamos, con quién la compartimos y qué derechos tienes sobre ella.
        </p>

        <section>
          <h2 className="text-lg font-semibold">Quién es el responsable de tus datos</h2>
          <p className="mt-2">
            GymEvo es operado por <strong>Oscar Hernán Hernández</strong>, persona natural, con domicilio en
            Colombia. Puedes contactarnos para cualquier tema de privacidad en{" "}
            <a href="mailto:gymevo@outlook.com" className="underline underline-offset-4">
              gymevo@outlook.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Qué datos recogemos</h2>
          <ul className="mt-2 list-disc pl-5 flex flex-col gap-1">
            <li>Tu correo electrónico (y tu nombre, si entras con Google), para crear tu cuenta, darte acceso y avisarte sobre tu plan y sus vencimientos.</li>
            <li>El nivel que elegiste (Principiante o Intermedio), tu meta (músculo o pérdida de grasa) y tu progreso dentro del plan.</li>
            <li>Tu historial de ejercicios: pesos, series y repeticiones que registras tú mismo.</li>
            <li>
              Datos corporales que ingresas voluntariamente para calcular tus macros (peso, estatura, edad,
              cintura). Son datos relacionados con tu salud, que la ley colombiana considera sensibles: nunca
              son obligatorios, no los necesitamos para darte tu plan y los usamos solo para ese cálculo.
              Puedes borrarlos cuando quieras eliminando tu cuenta.
            </li>
            <li>Tu nombre y, si decides subirla, una foto de perfil (desde tu cámara o galería).</li>
            <li>
              Si activas los recordatorios de entrenamiento, la suscripción técnica de notificaciones de tu
              navegador (un identificador de tu dispositivo, no tu ubicación ni datos personales adicionales).
            </li>
            <li>
              Datos de compra: el pago lo procesa directamente Hotmart, nuestra plataforma de cobro. GymEvo
              nunca ve ni almacena el número de tu tarjeta; solo recibimos de Hotmart tu correo, el plan
              elegido, las fechas y el estado del pago.
            </li>
            <li>
              Conteos anónimos de uso (por ejemplo, cuántas personas ven la página o terminan el
              cuestionario) y, si llegaste por un enlace de campaña, el nombre de esa campaña. No incluyen tu
              nombre, tu correo, tu IP ni nada que te identifique.
            </li>
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
            <li><strong>Hotmart</strong> — procesa tu pago y nos informa de tu compra (correo, plan, fechas y estado).</li>
            <li><strong>Google</strong> — solo si eliges &quot;Continuar con Google&quot;: confirma tu identidad y nos entrega tu correo y tu nombre.</li>
            <li><strong>Supabase</strong> — guarda tu cuenta, tu progreso y tu foto de perfil (base de datos, autenticación y almacenamiento de archivos).</li>
            <li><strong>Vercel</strong> — aloja y sirve la aplicación web.</li>
            <li><strong>Resend</strong> — envía el correo con tu código de acceso.</li>
          </ul>
          <p className="mt-2">
            No compartimos tu información con anunciantes ni la usamos para publicidad de terceros. GymEvo
            no usa cookies de rastreo ni píxeles publicitarios de ningún tipo.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Cookies y almacenamiento en tu dispositivo</h2>
          <p className="mt-2">
            Usamos solo lo indispensable para que la app funcione: una cookie de sesión para mantenerte
            dentro de tu cuenta y el almacenamiento local de tu navegador para recordar tu plan, tu progreso
            y la campaña por la que llegaste. No usamos cookies de publicidad, de análisis de terceros ni
            píxeles, por eso no te mostramos un aviso de cookies para aceptar o rechazar. Si algún día los
            agregamos, te pediremos permiso antes y actualizaremos esta política.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Edad mínima</h2>
          <p className="mt-2">
            GymEvo es solo para personas de 18 años o más. No recogemos a sabiendas datos de menores de
            edad; si descubrimos una cuenta de un menor, la eliminamos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Dónde se guardan tus datos (transferencia internacional)</h2>
          <p className="mt-2">
            Supabase, Vercel, Resend, Google y Hotmart operan con infraestructura fuera de Colombia (principalmente
            en Estados Unidos). Esto significa que tus datos viajan y se almacenan en esos países mientras
            te damos el servicio. Estos proveedores tienen sus propias políticas de protección de datos y
            acuerdos de tratamiento de datos con sus clientes. Al marcar la casilla de aceptación al crear
            tu cuenta autorizas esta transferencia, necesaria para que la app funcione.
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
            GymEvo, por su tamaño actual, no está obligado a inscribirse en el Registro Nacional de Bases
            de Datos (RNBD) de la SIC. Revisamos esta condición periódicamente a medida que el negocio
            crece. Este documento es también nuestra política de tratamiento de datos personales.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Tus derechos</h2>
          <p className="mt-2">
            Como titular de tus datos tienes derecho a conocerlos, actualizarlos, rectificarlos, pedir
            prueba de tu autorización, ser informado del uso que damos a tus datos, solicitar su
            eliminación, revocar la autorización que nos diste y presentar una queja ante la
            Superintendencia de Industria y Comercio (SIC) si crees que no respetamos la ley. Si compras
            desde México o Brasil, también puedes ejercer los derechos que te reconocen las leyes de tu
            país. Para ejercerlos, escríbenos a{" "}
            <a href="mailto:gymevo@outlook.com" className="underline underline-offset-4">
              gymevo@outlook.com
            </a>
            . Respondemos las consultas en un máximo de 10 días hábiles y los reclamos en un máximo de
            15 días hábiles, que son los plazos de la ley; normalmente lo hacemos mucho antes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Cómo eliminar tu cuenta</h2>
          <p className="mt-2">
            Desde tu Perfil dentro de la app puedes eliminar tu cuenta con un botón directo. Al hacerlo
            borramos tu perfil, tu historial de entrenamientos, tu foto, tus datos corporales y tus
            suscripciones a notificaciones, de inmediato y sin necesidad de escribirnos. La única excepción es el registro
            de tu compra en Hotmart (correo, fechas y estado del plan), que conservamos porque la
            ley nos obliga a llevar contabilidad de nuestros ingresos; nunca lo usamos para otra cosa.
            Mientras tu cuenta exista, guardamos tus datos para darte el servicio; los borramos cuando
            eliminas tu cuenta o nos lo pides.
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
            <a href="mailto:gymevo@outlook.com" className="underline underline-offset-4">
              gymevo@outlook.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
