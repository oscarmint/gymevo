# VEREDICTO revisor-visual — paywall
Fecha: 2026-09-02 00:00
Screenshot: docs/revisiones/paywall-375.png
Usabilidad: 30/40
Craft: 15/20
Copy (si vende): 17/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Timeline card, borde izquierdo] Los 5 anillos ámbar decorativos (espiral) no coinciden en número/ritmo con los 3 nodos reales del timeline y compiten visualmente con los propios dots verdes del timeline, generando una doble fila de puntos que puede leerse como paginador/stepper sin función → reducir a 3-4 anillos alineados a la altura de cada nodo real o fusionar ambos sistemas de puntos en uno solo.
2. [Paleta general de la pantalla] Papel cálido (#F5F1EA) + tinta verde (#5C7A1F) coincide en 2 de 3 ejes con el combo canónico vetado "Capítulo" (papel+verde+Petrona/Karla) del test anti-clon del eje 3; la tipografía difiere (Instrument Sans) por lo que no es clon exacto, pero es un riesgo de identidad que el propio registro anti-repetición de FICHA-ARTE ya advierte → desplazar el hue/saturación del verde o dar más presencia al ámbar como segundo acento dominante para distanciarse del par cream+verde puro.
3. [Headline, línea 1-2] La frase resaltada en acento "ganar músculo" se parte entre la línea 1 y la línea 2 ("ganar" / "músculo"), rompiendo la unidad visual del énfasis → ajustar el ancho/copy para que la frase resaltada quede en una sola línea.
4. [Flujo de pago, código] No existe ningún estado de error visible ni manejado si `checkoutUrl` falla o `window.location.href` no navega (heurística 9 sin evidencia) → agregar mensaje breve con reintento si el redirect no ocurre en unos segundos.
5. [Selección de plan, código] Cero persistencia de la elección del usuario entre visitas (heurística 7 al mínimo, solo hay un default fijo) → guardar la última selección de plan en localStorage y preseleccionarla en la próxima visita.
