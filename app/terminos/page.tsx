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
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Última actualización: 4 de septiembre de 2026 (versión 2)</p>

      <div className="prosa-legal mt-8 flex flex-col gap-6 text-base leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold">Quién ofrece este servicio</h2>
          <p className="mt-2">
            GymEvo es operado por <strong>Oscar Hernán Hernández Murillo</strong>, persona natural con domicilio en
            Colombia. Estos términos se rigen por las leyes de Colombia, y cualquier disputa se resuelve
            ante sus autoridades competentes.
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
            Debes tener al menos 18 años para crear una cuenta y contratar un plan en GymEvo.
            Si tienes entre 13 y 17 años, necesitas la autorización de tu representante legal antes de usar
            la app.
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
            que aún te quede. El pago lo procesa Hotmart.
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
          <h2 className="text-lg font-semibold">Vencimiento y renovación</h2>
          <p className="mt-2">
            Tu acceso dura hasta la fecha que ves en tu Perfil. Te avisamos antes de que venza para que
            puedas renovar, y después del vencimiento tienes unos días de gracia antes de que la app se
            bloquee. Como no hay cobros automáticos, no hay nada que cancelar: si no renuevas, el acceso
            simplemente termina. Los reembolsos se rigen por nuestra Política de Reembolsos.
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
            supera el monto que pagaste por tu plan vigente.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Contacto</h2>
          <p className="mt-2">
            <a href="mailto:soporte@gymevo.app" className="underline underline-offset-4">
              soporte@gymevo.app
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
