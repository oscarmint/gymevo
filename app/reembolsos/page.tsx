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
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Última actualización: 26 de septiembre de 2026 (versión 3)</p>

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
          <h2 className="text-lg font-semibold">Prueba gratis y planes de acceso</h2>
          <p className="mt-2">
            Al crear tu cuenta tienes 7 días de prueba con acceso completo y sin ningún cobro; al terminar,
            para seguir usando la app debes elegir un plan y realizar el pago. Los planes (Mensual,
            Semestral y Anual) dan acceso por el período elegido y no se renuevan solos. La Garantía del
            Primer Plan Claro descrita arriba corre desde la fecha de tu pago.
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
            <a href="mailto:gymevo@outlook.com" className="underline underline-offset-4">
              gymevo@outlook.com
            </a>{" "}
            indicando el correo con el que compraste, o pide el reembolso directamente desde tu
            portal de compras de Hotmart. Procesamos las solicitudes que nos llegan por correo en un
            máximo de 5 días hábiles. Al aprobarse un reembolso, tu acceso al plan reembolsado termina.
            Si el dinero no aparece en tu medio de pago, el tiempo de devolución depende de tu banco o
            tarjeta y de Hotmart.
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
