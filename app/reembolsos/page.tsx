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

      <div className="prosa-legal mt-8 flex flex-col gap-6 text-base leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold">La Garantía del Primer Plan Claro</h2>
          <p className="mt-2">
            Si dentro de tus primeros 7 días desde que se te cobra GymEvo no te muestra con claridad qué
            hacer cada vez que entras al gimnasio, escríbenos y te devolvemos el 100% de ese cobro. Sin
            preguntas, sin formularios. Esta garantía aplica a los 3 planes (Mensual, Semestral y Anual).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Prueba gratis y pago único, sin cobros automáticos</h2>
          <p className="mt-2">
            Al crear tu cuenta tienes 7 días de prueba con acceso completo, sin dejar tarjeta y sin ningún
            cobro; al terminar, la app te pide elegir un plan. Todos los planes (Mensual, Semestral y Anual) son de pago único: pagas una vez por el período
            elegido y no guardamos tu tarjeta ni hacemos cobros recurrentes. La Garantía del Primer Plan
            Claro descrita arriba corre desde la fecha de tu pago.
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
            indicando el correo con el que compraste, o pide el reembolso directamente desde tu
            portal de compras de Hotmart. Procesamos las solicitudes que nos llegan por correo en un
            máximo de 5 días hábiles.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Después del período de garantía</h2>
          <p className="mt-2">
            Pasados los 7 días desde tu pago, el período ya pagado no es reembolsable salvo que la ley
            aplicable indique lo contrario. Como no hay renovación automática, no tienes que cancelar
            nada: tu acceso termina solo al vencer el período.
          </p>
        </section>
      </div>
    </main>
  );
}
