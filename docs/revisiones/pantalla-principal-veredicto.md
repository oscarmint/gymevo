# VEREDICTO revisor-visual — pantalla-principal
Fecha: 2026-08-31 00:00
Screenshot: docs/revisiones/pantalla-principal-375.png
Usabilidad: 32/40
Craft: 15/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [card de ejercicio pendiente] Demasiados elementos por card (nombre, meta, link "¿Cómo se hace?", ícono refrescar, input kg, botón) compiten por atención → agrupar acciones secundarias (video + refrescar) en una sola fila o menú, dejando máximo 4-5 elementos visibles.
2. [input "kg" de cada ejercicio] El peso es opcional y si se deja vacío se registra en silencio como 0 (peso = Number(pesoTexto) || 0 en app/app/page.tsx) sin avisar al usuario → mostrar un aviso o pedir confirmación antes de guardar sin peso.
3. [nav inferior] No hay transición animada al cambiar entre "Plan de hoy / Historial / Perfil" (Link de Next sin animación) → falta 1 de las 7 baseline de movimiento (Eje 4) → agregar fade/slide de 200-250ms entre rutas.
4. [paleta general] Papel cálido + acento verde tinta se acerca al arquetipo "cuaderno" genérico del propio banco de ejemplos del SO → reforzar el dispositivo ownable (tachado + chip punteado) haciéndolo más presente, o sumar la 2ª nota de color que FICHA-ARTE.md deja pendiente.
5. [título del ejercicio vs. meta-texto] Poco contraste de tamaño entre el nombre del ejercicio y el texto de series/tempo/descanso — jerarquía se siente algo plana (Eje 1) → subir el nombre del ejercicio a ~17-18px o bajar peso del meta-texto.
