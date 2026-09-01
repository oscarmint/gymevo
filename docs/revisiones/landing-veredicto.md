# VEREDICTO revisor-visual — landing
Fecha: 2026-08-31 00:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 33/40
Craft: 13/20
Copy (si vende): 19/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Identidad — paleta global] Papel cálido `#F5F1EA` + verde tinta `#5C7A1F` como único acento reproduce casi punto por punto la combinación VETADA "Capítulo" (papel cálido + tinta verde) del banco canónico; solo la tipografía difiere (Instrument Sans vs Petrona/Karla) → fix: introducir la 2ª nota de color pendiente (ámbar tierra mencionada en FICHA-ARTE) en al menos un elemento visible (badge, hito, hairline) o desplazar el hue del verde/fondo lo suficiente para dejar de leerse como el mismo par.
2. [Identidad — dispositivo ownable] El "tachado verde sobre ejercicio completado" (dispositivo ownable de la ficha) solo aparece DENTRO del screenshot de producto embebido en el Hero; ningún componente propio del chrome de marketing (CheckCustom, Hairline, chip del mecanismo, H1) lo referencia → fix: llevar el motivo de "tachar/anotar a mano" a un elemento de marca de la propia landing (p. ej. un subrayado irregular bajo la palabra en acento del H1, o el CheckCustom con trazo de tachado en vez de check de sistema).
3. [Sección "La app por dentro" — carrusel de frames] Solo hay dots + mask-fade lateral; el primer frame no asoma borde del siguiente frame y no hay texto/ícono que indique que es deslizable → un usuario puede leerlo como una sola imagen fija → fix: reducir el padding lateral inicial para que 15-20px del segundo frame asomen, o agregar "Desliza →" la primera vez que se ve la sección.
4. [Entre Solución y "La app por dentro"] El botón "Crear mi plan de mañana gratis" repetido queda con `pb-4` seguido del `pt-16` de la siguiente sección (~80px en mobile) — mejor que el vacío anterior de 110-140px, pero sigue por encima de la proximidad esperada (24-32px) para lo que el propio código llama "el mismo movimiento visual" → fix: bajar el pt de AppPorDentro a `compacta` cuando sigue inmediatamente a un CTA repetido.
5. [Oferta — card Mensual] El CTA usa el verbo "Elegir mensual", distinto al verbo repetido en el resto de la página ("Crear/Empezar mi plan de mañana gratis"), rompiendo la regla del kit de "MISMO verbo del CTA héroe" y diluyendo la dirección a una sola acción (eje 5 de copy) → fix: unificar a un CTA del mismo verbo, ej. "Empezar con el plan mensual".
