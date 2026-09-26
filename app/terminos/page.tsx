import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Términos y Condiciones — GymEvo",
};

export default function TerminosPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-16 md:py-24 [font-family:var(--font-body)] text-[var(--text-primary)]">
      <Link href="/" className="mb-10 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
        <Logo className="size-9 text-[var(--accent)]" />
        GymEvo
      </Link>

      <h1 className="text-4xl font-bold [font-family:var(--font-display)]">Términos y Condiciones</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Última actualización: 26 de septiembre de 2026 (versión 3)</p>

      <div className="prosa-legal mt-8 flex flex-col gap-6 text-base leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold">Quién ofrece este servicio</h2>
          <p className="mt-2">
            GymEvo es operado por <strong>Oscar Hernán Hernández Murillo</strong>, persona natural con domicilio en
            Colombia. Estos términos se rigen por las leyes de Colombia, y cualquier disputa se resuelve
            ante sus autoridades competentes, sin perjuicio de los derechos de consumidor que la ley de tu
            país de residencia te reconozca y que no se pueden renunciar.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Qué es GymEvo (y qué no es)</h2>
          <p className="mt-2">
            GymEvo es una aplicación que entrega planes de entrenamiento estructurados (Ruta
            Principiante de 90 días y Ruta Intermedio) para usarse en gimnasios comerciales, junto
            con un Botón de Rescate para sustituir ejercicios cuando el equipo está ocupado, y una
            calculadora de macros basada en fórmulas nutricionales estándar (no en inteligencia
            artificial). GymEvo no es un entrenador personal, un nutricionista ni un servicio médico —
            es una herramienta de planificación que tú ejecutas bajo tu propio criterio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Edad mínima</h2>
          <p className="mt-2">
            GymEvo es solo para personas de 18 años o más. Al crear tu cuenta declaras que tienes esa edad.
            Si descubrimos que una cuenta pertenece a un menor, la cerramos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Licencia de uso</h2>
          <p className="mt-2">
            Te damos una licencia personal, intransferible y no exclusiva para usar GymEvo mientras tengas
            un plan con acceso vigente. Las rutinas, textos e ilustraciones de la app son propiedad de GymEvo o
            de sus licenciantes — no puedes copiarlas, revenderlas ni redistribuirlas fuera de tu uso
            personal.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Planes y pagos</h2>
          <p className="mt-2">
            GymEvo se ofrece en planes de acceso: Mensual (1 mes), Semestral (6 meses) o Anual (12 meses).
            Al crear tu cuenta recibes 7 días de prueba gratuita con acceso completo; al terminar, para
            seguir usando la app debes elegir un plan y realizar el pago. Pagas por el período elegido con
            los medios de pago que ofrece Hotmart. No hay renovación automática: cuando tu acceso termine,
            decides si renuevas pagando de nuevo. Los meses de una renovación se suman al tiempo de acceso
            que aún te quede. El pago lo procesa Hotmart, que actúa
            como plataforma de venta; la app y tu acceso los da GymEvo. Durante programas de prueba
            cerrada (beta) podemos darte un periodo de acceso gratuito más largo, sin ningún cobro.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Aviso importante sobre salud</h2>
          <p className="mt-2">
            GymEvo no reemplaza la evaluación de un médico o entrenador certificado. Si tienes una
            condición de salud preexistente, consulta a un profesional antes de empezar cualquier
            programa de ejercicio. El uso de la app es bajo tu propia responsabilidad, y GymEvo no se
            hace responsable por lesiones derivadas de una técnica incorrecta o de ignorar esta
            recomendación.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Uso aceptable y tu contenido</h2>
          <p className="mt-2">
            Usa GymEvo solo para tu entrenamiento personal: no compartas tu cuenta, no intentes copiar el
            contenido de forma automática ni vulnerar la seguridad. Los datos, la foto y los registros que
            subes siguen siendo tuyos; solo nos das permiso para guardarlos y mostrártelos dentro de la app.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Resultados</h2>
          <p className="mt-2">
            Los resultados dependen de tu constancia, tu alimentación, tu descanso y tu cuerpo. GymEvo no
            garantiza pérdida de grasa, ganancia de músculo ni ningún resultado físico concreto.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Vencimiento y renovación</h2>
          <p className="mt-2">
            Tu acceso dura hasta la fecha que ves en tu Perfil. Te avisamos antes de que venza para que
            puedas renovar, y después del vencimiento tienes unos días de gracia antes de que la app se
            bloquee. Como no hay cobros automáticos, no hay nada que cancelar: si no renuevas, el acceso
            simplemente termina. Los reembolsos se rigen por nuestra Política de Reembolsos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Cambios a estos términos</h2>
          <p className="mt-2">
            Si cambiamos estos términos de forma importante, te avisaremos por correo o dentro de la app
            antes de que apliquen. Los cambios no afectan el periodo que ya pagaste.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Suspensión o terminación de cuentas</h2>
          <p className="mt-2">
            Podemos suspender o cerrar tu cuenta si detectamos uso fraudulento, intentos de vulnerar la
            seguridad de la app, o incumplimiento grave de estos términos. Te avisaremos por correo salvo
            que la ley o un riesgo de seguridad nos impida hacerlo.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Limitación de responsabilidad</h2>
          <p className="mt-2">
            GymEvo se ofrece &quot;tal cual&quot;. Dentro de lo permitido por la ley, no somos responsables por
            daños indirectos derivados del uso de la app. Nuestra responsabilidad total frente a ti nunca
            supera el monto que pagaste por tu plan vigente. Nada de esto limita los derechos que la ley
            de consumo de tu país te da y que no se pueden renunciar.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Contacto</h2>
          <p className="mt-2">
            <a href="mailto:gymevo@outlook.com" className="underline underline-offset-4">
              gymevo@outlook.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
