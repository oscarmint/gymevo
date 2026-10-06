import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { CLASE_BOTON_PRINCIPAL, CLASE_ENLACE_SECUNDARIO, PantallaDeError } from '@/components/PantallaDeError';

export default function NoEncontrada() {
  return (
    <PantallaDeError
      icono={<SearchX size={36} color="var(--bg)" strokeWidth={2.4} aria-hidden="true" />}
      titulo="No encontramos esa página"
      mensaje="El enlace puede estar mal escrito o la página ya no existe."
    >
      <Link href="/app" className={CLASE_BOTON_PRINCIPAL}>
        Ir a mi plan de hoy
      </Link>
      <Link href="/" className={CLASE_ENLACE_SECUNDARIO}>
        Volver al inicio
      </Link>
    </PantallaDeError>
  );
}
