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
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Última actualización: 28 de agosto de 2026</p>

      <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold">Qué es GymEvo</h2>
          <p className="mt-2">
            GymEvo es una aplicación que entrega planes de entrenamiento estructurados (Ruta
            Principiante de 90 días y Ruta Intermedio) para usarse en gimnasios comerciales, junto
            con un Botón de Rescate para sustituir ejercicios cuando el equipo está ocupado.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Suscripción y pagos</h2>
          <p className="mt-2">
            GymEvo se ofrece por suscripción mensual o anual, con 7 días de prueba gratuita. El
            pago lo procesa Hotmart. Al terminar el período de prueba, se cobra automáticamente el
            plan elegido salvo que canceles antes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Aviso importante sobre salud</h2>
          <p className="mt-2">
            GymEvo no reemplaza la evaluación de un médico o entrenador certificado. Si tienes una
            condición de salud preexistente, consulta a un profesional antes de empezar cualquier
            programa de ejercicio. El uso de la app es bajo tu propia responsabilidad.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Cancelación</h2>
          <p className="mt-2">
            Puedes cancelar tu suscripción cuando quieras desde tu cuenta o escribiendo a soporte.
            La cancelación evita el próximo cobro; no genera reembolsos automáticos del período ya
            pagado, salvo lo indicado en nuestra Política de Reembolsos.
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
