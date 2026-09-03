// Nombre que el usuario eligió para que le llamemos ("cómo quiere que le
// llamen", no necesariamente el de su correo). Cache local igual que el resto
// del progreso: se ve al instante, Supabase manda cuando responde.

const KEY = 'gymevo_nombre';

export function leerNombreLocal(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY);
}

export function guardarNombreLocal(nombre: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, nombre);
}

// Foto de perfil — mismo patrón de caché local que el nombre.
const KEY_AVATAR = 'gymevo_avatar_url';

export function leerAvatarLocal(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY_AVATAR);
}

export function guardarAvatarLocal(url: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_AVATAR, url);
}
