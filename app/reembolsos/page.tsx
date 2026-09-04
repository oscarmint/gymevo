import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Política de Reembolsos — GymEvo",
};

export default function ReembolsosPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-16 md:py-24 [font-family:var(--font-body)] text-[var(--text-primary)]">
      <Link href="/" className="mb-10 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
        <Logo className="size-9 text-[var(--accent)]" />
        GymEvo
      </Link>

      <h1 className="text-4xl font-bold [font-family:var(--font-display)]">Política de Reembolsos</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Última actualización: 4 de septiembre de 2026 (versión 2)</p>

      <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold">La Garantía del Primer Plan Claro</h2>
          <p className="mt-2">
            Si dentro de tus primeros 7 días desde que se te cobra GymEvo no te muestra con claridad qué
            hacer cada vez que entras al gimnasio, escríbenos y te devolvemos el 100% de ese cobro. Sin
            preguntas, sin formularios. Esta garantía aplica a los 3 planes (Mensual, Semestral y Anual).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Prueba gratuita (solo Semestral y Anual)</h2>
          <p className="mt-2">
            Si eliges el plan Semestral o Anual, tienes 7 días de prueba antes de que se te cobre nada — te
            avisamos por correo un día antes de que termine, y puedes cancelar sin costo en cualquier
            momento durante esos 7 días. El plan Mensual no tiene período de prueba: el cobro ocurre el
            mismo día en que te suscribes, y ahí empieza a correr la Garantía del Primer Plan Claro descrita
            arriba.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Garantía de Hotmart</h2>
          <p className="mt-2">
            Como piso legal, toda compra en GymEvo está además respaldada por la garantía estándar de
            Hotmart de 7 días desde la fecha de cobro, gestionada directamente en la plataforma de Hotmart —
            nunca prometemos menos días de los que Hotmart tiene configurados para nuestro producto.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Cómo pedir tu reembolso</h2>
          <p className="mt-2">
            Escribe a{" "}
            <a href="mailto:soporte@gymevo.app" className="underline underline-offset-4">
              soporte@gymevo.app
            </a>{" "}
            indicando el correo con el que te suscribiste, o pide el reembolso directamente desde tu
            portal de compras de Hotmart. Procesamos las solicitudes que nos llegan por correo en un
            máximo de 5 días hábiles.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Después del período de garantía</h2>
          <p className="mt-2">
            Pasados los 7 días desde tu cobro, puedes cancelar tu suscripción en cualquier momento para
            evitar el próximo cobro (con un toque desde tu Perfil), pero el período ya pagado no es
            reembolsable salvo que la ley aplicable indique lo contrario.
          </p>
        </section>
      </div>
    </main>
  );
}
