# Plan de mejora de GymEvo — 4 expertos (25/09/2026)

Base: auditoría de gymevoapp.com (producción), grabación del usuario en iPhone y el código.
Etiquetas: **[video]** visto en la grabación · **[web]** visto en producción · **[código]** confirmado en el repo · **[supongo]** hipótesis por verificar.

Meta del plan: **subir la conversión a pago sin perder confianza**. Orden de trabajo: primero lo que rompe la confianza (datos que se contradicen), luego lo que mueve la conversión, luego lo que sostiene el crecimiento.

---

## Fase 0 — Esta semana (7 días): confianza y errores que cuestan ventas

Todo esto es bajo esfuerzo. Ninguna tarea depende de otra, salvo la 0.1 que necesita datos del dueño.

| # | Tarea | Experto | Impacto | Esfuerzo | Dependencia |
|---|---|---|---|---|---|
| 0.1 | **Unificar los días de garantía** (web dice 7, brief dice 14) en landing, paywall, reembolsos, checkout y Hotmart | Producto + Marketing | Alto | Bajo | El dueño confirma en el panel de Hotmart |
| 0.2 | **Correo de soporte**: probar que `soporte@gymevo.app` recibe (la web es gymevoapp.com); si no, cambiarlo | Producto | Alto | Bajo | El dueño |
| 0.3 | **Precio en pesos igual al de Hotmart** (landing ≈ $99.900/año; Hotmart cobra $106.179 COP, 6 % más) | Marketing | Alto | Bajo | — |
| 0.4 | **Checkout de Hotmart con marca**: nombre "GymEvo Anual" (hoy "Gymevo."), descripción con garantía y prueba gratis | Marketing | Alto | Bajo | Panel de Hotmart |
| 0.5 | **Subir a producción** el rediseño de paywall/oferta/onboarding y las correcciones (hoy producción es la versión anterior) | Frontend | Alto | Bajo | Autorización del dueño |
| 0.6 | **Landing: quitar el botón duplicado** (barra fija + botón de la página a la vez) y subir la flecha de "volver arriba" para que no tape texto de precios [video] | Diseño | Alto | Bajo | — |
| 0.7 | **Imagen al compartir el enlace**: etiquetas `og:title`, `og:description`, `og:image` (1200×630) [web] | Frontend + Marketing | Alto | Bajo | Una imagen |
| 0.8 | **Perfil**: cambiar "Desactivar mi suscripción" por "Cancelar acceso" [video][código] | Producto | Medio | Bajo | — |
| 0.9 | **Landing**: regenerar la maqueta con fecha neutra (hoy dice 16/09/2026) [video] | Diseño | Bajo | Bajo | — |
| 0.10 | **Técnico**: `robots.txt`, `sitemap.xml`, `favicon.ico`, cabeceras `X-Frame-Options`, `nosniff`, `Referrer-Policy` [web] | Frontend | Medio | Bajo | — |

Ya hecho en el código (falta subir): botón "Iniciar entrenamiento" sobre el selector de rutinas; plural "tu última sesión".

---

## Fase 1 — Días 8 a 30: conversión y activación

### 1.1 Experto en Producto — que la persona sienta el mecanismo antes de pagar
- **Demo tocable del Botón de Rescate** en la vista previa del Día 1: un ejercicio con el botón que cambia a su alternativa. Es la mejora de mayor impacto esperado. Esfuerzo medio.
- **Ruta principiante más suave**: cambiar peso muerto con barra del Día 1 por peso muerto rumano con mancuerna o kettlebell (ya está en el catálogo). Bajo. [supongo] reduce abandono por miedo a lesionarse; verificar en la app.
- **Plan del día menos denso**: plegar "¿Qué tal se sintió la serie?" para el nivel principiante y dejarlo visible solo en intermedio. Medio.
- **Transiciones del onboarding sin pantalla vacía** (≈3 s en blanco entre pasos [video]): entrada inmediata del paso siguiente, salida de 150 ms. Medio.

### 1.2 Experto en Diseño — jerarquía y claridad
- **Paywall**: una sola línea de microcopy bajo el botón (hoy 4 líneas apiladas), subir contraste de las líneas de pesos colombianos, y un detalle propio del Botón de Rescate en la tarjeta del mecanismo. Bajo.
- **Calendario**: distinguir "Rutina disponible" de "80 % o más" (hoy casi el mismo verde) con contorno punteado. Bajo. [video]
- **Perfil**: quitar la foto de gimnasio de fondo entre las tarjetas y usar fondo liso como el resto. Bajo. [video]
- **Unidades coherentes**: si eligió libras, mostrar también el peso corporal en libras. Bajo. [video]
- **Landing**: sello de garantía pegado al botón principal y quitar la columna "Incluido" repetida en la oferta. Bajo.

### 1.3 Experto en Frontend y rendimiento
- Medir **Core Web Vitals reales** (LCP, INP, CLS) en un Android de gama media; hoy no hay dato fiable. Bajo. Herramienta: PageSpeed Insights sobre gymevoapp.com.
- El video del hero y las capturas de la landing: comprimir y cargar bajo demanda. Medio. [supongo] pesa en 4G.
- Login: sumar **"Continuar con Google"** además del código por correo. Medio.
- Instrumentar el embudo con eventos (ver métricas): visita, inicio de onboarding, paso por paso, vista del paywall, clic en pago, clic en prueba, llegada al checkout. Medio.

### 1.4 Experto en Marketing y Growth
- **Prueba gratis como camino principal**: dos opciones claras en el paywall, "Elegir mi plan" y "Empezar 7 días gratis, sin tarjeta". Bajo. (Ya está en el código sin subir.)
- **Recuperación de quien no paga**: al salir del paywall, "Te mando tu plan por correo" y una secuencia de 3 correos (día 0, 2, 5) con el plan del Día 1, una técnica clave y la prueba gratis. Medio.
- **Beta cerrada de 15 a 30 personas**: 30 días de acceso a cambio de un testimonio real con permiso de publicación. El dueño invita; yo preparo el mensaje de invitación, el formulario con casilla de autorización y la sección de testimonios (oculta hasta tener los primeros). Medio.
- **Sin testimonios inventados**: regla permanente.

---

## Fase 2 — Días 31 a 90: crecimiento y retención

- **Referidos**: "regala 7 días a un amigo del gym", con recompensa para quien invita. Medio.
- **Contenido corto de técnica** (30 s) por ejercicio clave para redes, usando las ilustraciones. Medio.
- **Retención**: medir el efecto de recordatorios de racha y del aviso de inactividad ya construidos; ajustar hora según el horario elegido en el onboarding. Medio.
- **Pricing**: con 60 días de datos, probar precio anual $34.99 contra $29.99 y Mensual $5.99. Bajo.
- **Alianzas**: gimnasios pequeños y entrenadores de planta como afiliados en Hotmart. Medio.
- **SEO**: 5 páginas de contenido para búsquedas reales ("qué hacer en el gym si no sé", "rutina principiante 4 días"). Alto.

---

## Experimentos A/B (cuando haya tráfico)

| # | Hipótesis | Variante | Métrica |
|---|---|---|---|
| 1 | La prueba gratis como botón principal sube el inicio de prueba | Botón "Empezar 7 días gratis" vs. enlace bajo el pago | Inicio de prueba; pago a 14 días |
| 2 | Tocar el Rescate antes de pagar sube la conversión | Demo tocable vs. sin demo | Paso de vista previa a pago |
| 3 | El mecanismo convence más que el dolor | "Otro ejercicio en 1 toque" vs. "Nunca más sin saber qué hacer" | Clic en el primer botón |
| 4 | Preseleccionar el Anual mejora ingresos por visitante | Anual preseleccionado vs. ninguno | Mezcla de planes, ingresos por visitante |
| 5 | Mostrar el precio igual al de Hotmart baja el abandono | Precio igual vs. actual | Abandono en el checkout |

---

## Métricas y valores razonables

| Métrica | Valor razonable |
|---|---|
| Visita → onboarding | 25–40 % |
| Onboarding completado | 60–75 % |
| Prueba iniciada | 4–8 % de visitantes |
| Prueba → pago | 20–25 % (referencia general de `FICHA-MERCADO.md`, no del nicho) |
| Retención a 7 días | 30–40 % |
| Reembolsos | < 5 % |

---

## Lo que NO se hace en este plan
- No se inventan testimonios, caras ni cifras de usuarios.
- No se declara ninguna pantalla como lista sin veredicto del revisor visual (landing, paywall y onboarding siguen en NO LISTA; puntajes y pendientes en `ESTADO.md`).
- No se vende con publicidad paga hasta cerrar la Fase 0 y tener la beta corriendo.

## Decisiones que necesita del dueño
1. Días de garantía en Hotmart: **7 o 14**.
2. Estado del correo **soporte@gymevo.app**.
3. Autorización para **subir a GitHub** los dos commits pendientes.
4. Luz verde para la **demo del Botón de Rescate** y el material de la **beta**.
5. Lista de 15 a 30 personas para invitar a la beta.
