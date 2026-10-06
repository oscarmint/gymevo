// Lectura y escritura PROTEGIDAS de localStorage / sessionStorage.
//
// En una PWA que guarda el progreso en el teléfono, el almacenamiento puede
// estar bloqueado (modo privado estricto, "bloquear cookies") o lleno, y lanza
// excepciones en getItem/setItem. Sin esta capa, una excepción dentro de un
// efecto o de un clic dejaba la pantalla rota o el botón sin hacer nada
// (auditoría 05/10/2026). Aquí nada lanza: leer devuelve null y escribir
// devuelve false, y la app sigue funcionando en memoria.

export function leerLocal(clave: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}

export function escribirLocal(clave: string, valor: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(clave, valor);
    return true;
  } catch {
    return false;
  }
}

export function leerSesion(clave: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(clave);
  } catch {
    return null;
  }
}

export function escribirSesion(clave: string, valor: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.sessionStorage.setItem(clave, valor);
    return true;
  } catch {
    return false;
  }
}
