'use client';

// KIT DE LANDING — sección "Mecanismos" (27/09/2026, pedido del usuario tras
// la campaña "Tu gimnasio, por fin bajo control"): cascada de 4 preguntas del
// avatar con su respuesta en UNA palabra — Rescate, Técnica, Plan, Registro.
// Rescate va primero y más grande porque sigue siendo EL mecanismo bautizado
// de FICHA-AVATAR.md; las otras 3 son apoyo, nunca compiten con él en peso
// visual (así no se diluye el ángulo "mecanismo al frente" ya decidido).

import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { IconChip, Kicker, SectionShell, useReveal, VIEWPORT_ONCE } from './ui';

export interface RespuestaMecanismo {
  icon: LucideIcon;
  /** La pregunta del avatar, tal como la haría él (FICHA-AVATAR.md). */
  pregunta: string;
  /** La respuesta en UNA palabra — el nombre real del mecanismo en la app. */
  respuesta: string;
}

export interface MecanismosProps {
  kicker?: string;
  /** El primero de la lista es el protagonista (más grande) — pensado para
   * Rescate, el mecanismo bautizado; los siguientes son apoyo. */
  items: [RespuestaMecanismo, RespuestaMecanismo, RespuestaMecanismo, RespuestaMecanismo];
  id?: string;
}

export function Mecanismos({ kicker = 'TODO BAJO CONTROL', items, id }: MecanismosProps) {
  const [protagonista, ...apoyo] = items;
  const { contenedor, item } = useReveal();

  return (
    <SectionShell id={id} elevacion="elevada" ariaLabel="Cómo lo logras">
      <motion.div
        variants={contenedor}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="mx-auto max-w-[780px]"
      >
        <motion.div variants={item}>
          <Kicker>{kicker}</Kicker>
        </motion.div>

        {/* Protagonista — Rescate: tarjeta grande, sola en su fila. */}
        <motion.div
          variants={item}
          className="flex items-start gap-4 rounded-[var(--radius-card)] bg-[var(--bg)] p-5 shadow-[var(--shadow-2)]"
        >
          <IconChip icon={protagonista.icon} tone="accent" />
          <div className="min-w-0">
            <p className="text-[15px] text-[var(--text-secondary)]">{protagonista.pregunta}</p>
            <p className="mt-1 text-[26px] font-bold leading-none text-[var(--accent)] [font-family:var(--font-display)]">
              {protagonista.respuesta}
            </p>
          </div>
        </motion.div>

        {/* Apoyo — Técnica, Plan, Registro: 3 tarjetas más chicas en fila. */}
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {apoyo.map((m, i) => (
            <motion.li
              key={i}
              variants={item}
              className="flex flex-col items-start gap-3 rounded-[var(--radius-card)] bg-[var(--bg)] p-4 shadow-[var(--shadow-1)]"
            >
              <IconChip icon={m.icon} tone="muted" />
              <div className="min-w-0">
                <p className="text-[13px] leading-snug text-[var(--text-secondary)]">{m.pregunta}</p>
                <p className="mt-1 text-[19px] font-bold leading-none text-[var(--text-primary)] [font-family:var(--font-display)]">
                  {m.respuesta}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </SectionShell>
  );
}
