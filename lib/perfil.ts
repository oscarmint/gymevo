// Nombre que el usuario eligió para que le llamemos ("cómo quiere que le
// llamen", no necesariamente el de su correo). Cache local igual que el resto
// del progreso: se ve al instante, Supabase manda cuando responde.

import { escribirLocal, leerLocal } from './almacen';

const KEY = 'gymevo_nombre';

export function leerNombreLocal(): string | null {
  return leerLocal(KEY);
}

export function guardarNombreLocal(nombre: string) {
  escribirLocal(KEY, nombre);
}

// Foto de perfil — mismo patrón de caché local que el nombre.
const KEY_AVATAR = 'gymevo_avatar_url';

export function leerAvatarLocal(): string | null {
  return leerLocal(KEY_AVATAR);
}

export function guardarAvatarLocal(url: string) {
  escribirLocal(KEY_AVATAR, url);
}
