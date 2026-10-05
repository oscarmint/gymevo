# VEREDICTO revisor-visual — landing
Fecha: 2026-10-05 12:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 31/40
Craft: 14/20
Copy (si vende): 18/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: 1) PrecioAnimado/useConteo cuenta al montar la pagina (no al entrar en vista) y el HTML inicial renderiza 0.00: el conteo corre fuera de pantalla y el usuario nunca lo ve; hay riesgo de flash "$0.00" en SSR/hidratacion. 2) Carga cognitiva alta: pagina de ~9900px con 5 preguntas de dolor, 4 mecanismos, stack de 5 lineas + como-funciona + 3 planes antes del CTA de oferta. 3) Contradiccion de copy: "Renuevalo cuando quieras" (Mensual) vs "pago unico / sin renovacion automatica". 4) Screenshot ilegible a la resolucion entregada (73x2000 en vista): detalles de encaje y contraste por seccion no verificables. 5) Sin prueba social real (solo garantia) y sin valor por linea en el stack: eje especificidad/oferta en 3.
