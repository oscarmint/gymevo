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
      <rect x="60" y="58" width="35" height="24" rx="4" />
      <rect x="145" y="58" width="35" height="24" rx="4" />
      <rect x="95" y="40" width="50" height="8" rx="2" />
      <rect x="95" y="92" width="50" height="8" rx="2" />
      {/* Reloj de arena real: arriba HUECO (solo el marco curvo, el vidrio sin
          arena — se logra con evenodd: contorno externo + contorno interno
          más pequeño, así el hueco es transparencia real, no un parche de
          color que se rompería sobre cualquier fondo), abajo SÓLIDO (la
          arena ya caída). Medido sobre la imagen de referencia del usuario. */}
      <path
        fillRule="evenodd"
        d="M95,48 L145,48 C145,55 139,60 130,64 C123,67 120,68 120,70 C120,68 117,67 110,64 C101,60 95,55 95,48 Z
           M103,48 L137,48 C137,53 133,56 127,60 C123,62 120,62 120,62 C120,62 117,62 113,60 C107,56 103,53 103,48 Z"
      />
      <path d="M95,92 L145,92 C145,85 139,80 130,76 C123,73 120,72 120,70 C120,72 117,73 110,76 C101,80 95,85 95,92 Z" />
    </svg>
  );
}
