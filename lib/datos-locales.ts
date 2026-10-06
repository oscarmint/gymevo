// Borra todo lo que GymEvoApp guarda en ESTE dispositivo (claves `gymevo_*`
// de localStorage y sessionStorage: progreso, nombre, foto, respuestas del
// onboarding, plan elegido, UTM…). No toca la cuenta ni lo que ya esté subido
// a la nube — al volver a entrar, el progreso remoto se recupera. Lo usa la
// pantalla de error ("¿Sigue fallando?") y sirve también para cerrar sesión
// sin dejar datos personales para quien use el mismo navegador después
// (auditoría 05/10/2026). Cada paso va protegido: con el almacenamiento
// bloqueado o corrupto esto nunca debe lanzar.
const PREFIJO = 'gymevo';

function borrarClaves(almacen: Storage) {
  const claves: string[] = [];
  for (let i = 0; i < almacen.length; i++) {
    const clave = almacen.key(i);
    if (clave && clave.startsWith(PREFIJO)) claves.push(clave);
  }
  for (const clave of claves) almacen.removeItem(clave);
}

export function limpiarDatosLocales(): void {
  if (typeof window === 'undefined') return;
  try {
    borrarClaves(window.localStorage);
  } catch {
    // almacenamiento bloqueado (modo privado estricto): no hay nada que borrar
  }
  try {
    borrarClaves(window.sessionStorage);
  } catch {
    // ídem
  }
}
