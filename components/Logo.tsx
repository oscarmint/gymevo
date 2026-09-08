// Isotipo de GymEvo: un dumbbell con un reloj de arena al centro — el mismo
// diseño que aprobó el usuario, redibujado como vector (nítido a cualquier
// tamaño, sin fondo). `fill="currentColor"` para heredar el color del texto
// que lo envuelve; en la mayoría de usos va dentro de un `text-[var(--accent)]`.

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 140" className={className} fill="currentColor" aria-hidden="true">
      <rect x="10" y="52" width="14" height="36" rx="7" />
      <rect x="34" y="10" width="26" height="120" rx="10" />
      <rect x="180" y="10" width="26" height="120" rx="10" />
      <rect x="216" y="52" width="14" height="36" rx="7" />
      <rect x="60" y="61" width="35" height="18" rx="4" />
      <rect x="145" y="61" width="35" height="18" rx="4" />
      <rect x="95" y="25" width="50" height="9" rx="3" />
      <rect x="95" y="106" width="50" height="9" rx="3" />
      {/* Reloj de arena real: arriba HUECO (solo el marco, línea delgada de
          grosor uniforme — se dibuja con `stroke`, la herramienta correcta
          para una línea pareja que sigue una curva, no con relleno), abajo
          SÓLIDO (la arena ya caída). Medido y comparado lado a lado contra
          el archivo real de referencia del usuario (no a ojo). */}
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M96,33 C96,44 104,53 112,60 C117,65 120,67 120,70 C120,67 123,65 128,60 C136,53 144,44 144,33"
      />
      <path d="M120,70 C120,73 117,76 109,82 C100,89 95,96 95,107 L145,107 C145,96 140,89 131,82 C123,76 120,73 120,70 Z" />
    </svg>
  );
}
