// Isotipo de GymEvo: un dumbbell con un reloj de arena al centro — el mismo
// diseño que aprobó el usuario, redibujado como vector (nítido a cualquier
// tamaño, sin fondo). `fill="currentColor"` para heredar el color del texto
// que lo envuelve; en la mayoría de usos va dentro de un `text-[var(--accent)]`.

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 140" className={className} fill="currentColor" aria-hidden="true">
      <rect x="10" y="20" width="14" height="100" rx="7" />
      <rect x="34" y="10" width="26" height="120" rx="10" />
      <rect x="180" y="10" width="26" height="120" rx="10" />
      <rect x="216" y="20" width="14" height="100" rx="7" />
      <rect x="60" y="58" width="35" height="24" rx="4" />
      <rect x="145" y="58" width="35" height="24" rx="4" />
      <rect x="95" y="40" width="50" height="8" rx="2" />
      <rect x="95" y="92" width="50" height="8" rx="2" />
      <path d="M95,48 L145,48 L120,70 Z" />
      <path d="M95,92 L145,92 L120,70 Z" />
    </svg>
  );
}
