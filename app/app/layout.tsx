'use client';

// SHELL DE LA APP INTERNA — 3 secciones máximo (04-ARQUITECTURA): Plan del día
// (protagonista), Historial, Perfil. Tab bar inferior, siempre visible.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dumbbell, History, User } from 'lucide-react';

const TABS = [
  { href: '/app', label: 'Plan de hoy', icon: Dumbbell },
  { href: '/app/historial', label: 'Historial', icon: History },
  { href: '/app/perfil', label: 'Perfil', icon: User },
];

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] [font-family:var(--font-body)]">
      <div className="flex-1 pb-20">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] pb-[max(8px,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full max-w-md">
          {TABS.map((tab) => {
            const activo = tab.href === '/app' ? pathname === '/app' : pathname.startsWith(tab.href);
            const Icono = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11.5px] font-medium"
              >
                <span
                  className={
                    activo
                      ? 'chip-3d flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)]'
                      : 'flex h-9 w-9 items-center justify-center rounded-xl'
                  }
                >
                  <Icono size={20} color={activo ? 'var(--bg)' : 'var(--text-tertiary)'} strokeWidth={activo ? 2.4 : 2} />
                </span>
                <span className={activo ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
