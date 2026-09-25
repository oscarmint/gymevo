// Sección de testimonios REALES. Si no hay ninguno con permiso, no se pinta nada (sin
// huecos, sin relleno). Ver lib/testimonios.ts para la regla.
import { TESTIMONIOS } from '@/lib/testimonios';
import { Kicker, SectionShell } from './ui';

export function Testimonios({ titulo = 'Lo que dicen los primeros usuarios' }: { titulo?: string }) {
  const visibles = TESTIMONIOS.filter((t) => t.permisoPublicar && t.frase.trim() && t.nombre.trim());
  if (visibles.length === 0) return null;
  return (
    <SectionShell elevacion="elevada" ariaLabel="Testimonios">
      <div className="mx-auto max-w-[680px] px-5">
        <Kicker>Opiniones reales</Kicker>
        <h2 className="text-balance text-[26px] font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)] md:text-[36px]">
          {titulo}
        </h2>
        <ul className="mt-8 flex flex-col gap-4">
          {visibles.map((t) => (
            <li key={`${t.nombre}-${t.frase.slice(0, 12)}`} className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_22%,transparent)] bg-[var(--surface)] p-5">
              <blockquote className="text-[16px] leading-relaxed text-[var(--text-primary)]">“{t.frase}”</blockquote>
              <p className="mt-3 text-[14px] font-semibold text-[var(--text-primary)]">
                {t.nombre}
                {t.lugar ? <span className="font-normal text-[var(--text-secondary)]"> · {t.lugar}</span> : null}
              </p>
              {t.contexto ? <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">{t.contexto}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
