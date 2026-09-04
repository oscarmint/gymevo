// PANEL DEL DUEÑO — protegido en proxy.ts (server-side, profiles.role) + RLS
// admin en Supabase (migración 0011). Nunca confiar en ocultar este link.

import Link from 'next/link';
import { DollarSign, LayoutDashboard, Users } from 'lucide-react';

const TABS = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/costos', label: 'Costos', icon: DollarSign },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--bg)] [font-family:var(--font-body)]">
      <header className="border-b border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <p className="text-sm font-bold uppercase tracking-[0.06em] text-[var(--accent)]">Panel del dueño</p>
          <nav className="flex gap-4">
            {TABS.map((tab) => {
              const Icono = tab.icon;
              return (
                <Link key={tab.href} href={tab.href} className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)]">
                  <Icono size={16} /> {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-6">{children}</main>
    </div>
  );
}
