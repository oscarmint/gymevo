import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Reembolsos — GymEvo",
};

export default function ReembolsosPage() {
  return (
    <main className="mx-auto w-full max-w-[720px] px-5 py-16 md:py-24 [font-family:var(--font-body)] text-[var(--text-primary)]">
      <h1 className="text-[32px] font-bold [font-family:var(--font-display)]">Política de Reembolsos</h1>
      <p className="mt-2 text-[14px] text-[var(--text-secondary)]">Última actualización: 28 de agosto de 2026</p>

      <div className="mt-8 flex flex-col gap-6 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-[19px] font-semibold">La Garantía del Primer Plan Claro</h2>
          <p className="mt-2">
            Si dentro de tus primeros 7 días de suscripción GymEvo no te muestra con claridad qué
            hacer cada vez que entras al gimnasio, escríbenos y te devolvemos el 100% de tu pago.
            Sin preguntas, sin formularios.
          </p>
        </section>

        <section>
          <h2 className="text-[19px] font-semibold">Garantía de Hotmart</h2>
          <p className="mt-2">
            Como piso legal, toda compra en GymEvo está además respaldada por la garantía estándar
            de Hotmart de 7 días desde la fecha de compra, gestionada directamente en la plataforma
            de Hotmart.
          </p>
        </section>

        <section>
          <h2 className="text-[19px] font-semibold">Cómo pedir tu reembolso</h2>
          <p className="mt-2">
            Escribe a{" "}
            <a href="mailto:soporte@gymevo.app" className="underline underline-offset-4">
              soporte@gymevo.app
            </a>{" "}
            indicando el correo con el que te suscribiste. Procesamos el reembolso en un máximo de
            5 días hábiles.
          </p>
        </section>

        <section>
          <h2 className="text-[19px] font-semibold">Después del período de garantía</h2>
          <p className="mt-2">
            Pasados los 7 días, puedes cancelar tu suscripción en cualquier momento para evitar el
            próximo cobro, pero el período ya pagado no es reembolsable salvo que la ley aplicable
            indique lo contrario.
          </p>
        </section>
      </div>
    </main>
  );
}
