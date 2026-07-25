# Handoff: Finanzas App — Diseño UI/UX

## Overview
Rediseño moderno de una app de finanzas personales (presupuesto, deudas, metas de ahorro y gastos diarios en pesos chilenos, CLP). Fondos blancos, cards con box-shadow, look moderno tipo fintech. Incluye modo claro/oscuro. Se diseñó para **Vue + Bootstrap** como stack de destino.

## About the Design Files
Los archivos de este paquete son **referencias de diseño hechas en HTML** (un prototipo interactivo), no código de producción. La tarea es **recrear este diseño en el stack real del proyecto (Vue 3 + Bootstrap)**, usando componentes Bootstrap/Vue idiomáticos (o un sistema de componentes propio) en vez de copiar el HTML tal cual. El archivo `Finanzas App Design.dc.html` sirve solo como referencia visual/funcional — ábrelo en un navegador para inspeccionar layout, estados y copy exactos.

El prototipo agrupa las 3 vistas (Login, Mobile, Desktop) en un solo archivo con un selector arriba ("Login / Mobile · App / Desktop") solo para presentación — en la app real son rutas/vistas separadas.

## Fidelity
**Alta fidelidad (hifi)**: colores, tipografía, espaciados, sombras y textos están definidos y listos para implementar tal cual.

## Design Tokens

### Tipografía
- Familia: **Inter** (Google Fonts, pesos 400/500/600/700/800). Fallback `system-ui, sans-serif`.
- Escala usada: 10–11px (labels/eyebrows, uppercase, letter-spacing 0.05–0.08em), 12–14px (body/inputs), 15–17px (títulos de card), 19–22px (títulos de pantalla), 26–30px (cifras destacadas, KPI de tasa de ahorro).
- Pesos: 600 (botones/inputs), 700 (labels, nombres, montos), 800 (títulos, cifras KPI).

### Colores — Modo claro
- Fondo app: `#FFFFFF`
- Fondo canvas/página (fuera del "device"): `#F1F2F4`
- Card: `#FFFFFF`, borde `rgba(20,22,30,0.07)`
- Card alterno (fondos de barra de progreso, sidebar): `#F5F6F8`
- Input background: `#FAFAFB`
- Texto principal (ink): `oklch(20% 0.015 265)` (~#181A22)
- Texto secundario (inkSoft): `oklch(48% 0.02 265)`
- Texto terciario (inkFaint): `oklch(63% 0.015 265)`
- Acento primario (indigo): `oklch(56% 0.19 275)` (~#4F46E5)
- Acento suave (fondos de badges activos): `oklch(94% 0.03 275)`
- Éxito/positivo: `oklch(55% 0.14 150)`, fondo `oklch(94% 0.05 150)`
- Error/negativo/deuda: `oklch(58% 0.18 25)`, fondo `oklch(95% 0.05 25)`
- Shadow de card: `0 2px 10px rgba(20,22,40,0.06)`
- Shadow de frame/modal: `0 24px 60px rgba(20,22,40,0.14)`

### Colores — Modo oscuro
- Fondo app: `oklch(19% 0.012 265)` (~#14161C)
- Card: `oklch(23% 0.013 265)`, borde `rgba(255,255,255,0.09)`
- Card alterno: `oklch(27% 0.013 265)`
- Texto principal: `oklch(96% 0.004 265)`
- Texto secundario: `oklch(72% 0.02 265)`
- Texto terciario: `oklch(55% 0.02 265)`
- Acento primario: `oklch(72% 0.15 275)`
- Éxito: `oklch(70% 0.14 150)` / fondo `oklch(28% 0.05 150)`
- Error: `oklch(70% 0.16 25)` / fondo `oklch(30% 0.06 25)`
- Shadow de card: `0 2px 10px rgba(0,0,0,0.35)`
- Shadow de frame: `0 20px 60px rgba(0,0,0,0.5)`

### Colores de categoría (puntos/badges de gasto)
Mismo modelo oklch, hue fijo por categoría (L/C suben levemente en modo oscuro: 56%/0.14 claro → 68%/0.13 oscuro):
Arriendo/Dividendo `255`, Servicios básicos `220`, Alimentación `145`, Transporte `35`, Salud `200`, Educación `300`, Entretenimiento `340`, Deudas `25`, Seguros `190`, Otros `60`.

### Espaciado y forma
- Radio de card: 14–16px. Radio de inputs/botones: 7–10px. Radio de frame mobile: 32px. Radio de frame desktop/login: 20–24px.
- Padding de card: 14–22px. Gap entre cards en grid: 10–16px.
- Bordes: 1–1.5px solid, color `border` del token de tema.
- Barras de progreso: alto 6–9px, radio 4–6px, fondo `cardAlt`.

### Toggle claro/oscuro (control reutilizado en Login, header mobile, sidebar desktop)
Switch tipo iOS: track 44×24px (38×21px en sidebar), radio 999px, thumb circular blanco 20px (17px chico) con `box-shadow: 0 1px 3px rgba(0,0,0,0.3)`. Track = acento cuando está en oscuro, `#D8DBE0` en claro. Thumb se anima de `left: 2px` a `left: 22px` (o `19px` en la versión chica).

## Login (vista compartida — mobile y desktop usan el mismo diseño responsivo)
**Propósito:** autenticación de entrada a la app.

**Layout:** contenedor centrado de 1040×660px máx (responsive, `max-width:100%`, `max-height:85vh`), `border-radius:24px`, `box-shadow` de frame, `display:grid` 2 columnas iguales.
- **Columna izquierda (panel de marca):** fondo `linear-gradient(135deg, accent, oklch(42% 0.15 305))`, texto blanco, padding 48px. Dos círculos decorativos translúcidos (`rgba(255,255,255,0.08)` y `0.06`) posicionados absolutos fuera de los bordes (top:-100px/right:-100px y bottom:-60px/left:-60px), radio 50%, tamaños 320px y 220px. Contiene: logo "F" (44×44px, radio 12px, `rgba(255,255,255,0.18)`), wordmark "Finanzas" (28px/800), tagline ("Tu sistema financiero personal: presupuesto, deudas, metas y gastos en un solo lugar."), copyright al pie ("© 2026 Finanzas").
- **Columna derecha (formulario):** padding 52px 56px, contenido centrado verticalmente. Toggle de tema arriba a la derecha (posición absoluta, top:22px right:24px) con label de texto ("Claro"/"Oscuro"). Título "Bienvenido de vuelta" (22px/700) + subtítulo "Ingresa tus datos para continuar" (14px, inkSoft).
  - Campo Correo electrónico (label uppercase 11.5px/700 inkSoft, input 12x14px padding, radio 10px, borde `border`, fondo `inputBg`).
  - Campo Contraseña con botón "Mostrar"/"Ocultar" superpuesto a la derecha (texto, color acento, sin ícono de ojo).
  - Fila: checkbox "Recuérdame" (izquierda) + link "¿Olvidaste tu contraseña?" (derecha, color acento).
  - Botón primario "Iniciar sesión" full width, fondo acento, texto blanco, 700, radio 10px.
  - Divisor "o" entre dos líneas horizontales.
  - Botón secundario outline "Crear cuenta nueva" (borde `border`, fondo transparente).

**Estados:** el toggle de mostrar/ocultar contraseña cambia el `type` del input; el toggle de tema recolorea todo el panel derecho y el gradiente de marca no cambia (mismo gradiente en ambos modos). No hay validación de formulario implementada en el prototipo — implementar validación estándar (email válido, password no vacío) y estado de error (borde rojo + mensaje) en el desarrollo real.

## Mobile App (vista independiente, 390×780px de referencia — diseñar mobile-first, fluido en ancho real de dispositivo)
**Estructura de pantalla (persistente en las 5 pestañas):**
- **Header** (padding 22px 20px 14px): eyebrow uppercase 11px con el nombre de la pestaña activa, saludo "Hola, Ignacio" (20px/800), toggle de tema a la derecha.
- **Contenido**: área scrolleable (`flex:1; overflow-y:auto`).
- **Bottom nav** fijo: 5 botones iguales (`flex:1`), ícono SVG 20×20 (stroke, 2px, sin relleno) + label 9.5px/700. Color activo = acento, inactivo = inkFaint. Íconos: barras (Resumen), billetera/rect con línea (Presupuesto), tarjeta (Deudas), diana/target (Metas), recibo (Gastos).

**Pestaña Resumen:**
- Selector de mes (card con `‹ Julio 2026 ›`).
- Grid 2×2 de KPIs: Ingresos, Gasto real (rojo si excede ingresos), Saldo estimado (verde/rojo), Deuda total.
- Card "Tasa de ahorro": cifra grande (24px/800, verde si ≥20%, rojo si menos) + barra de progreso + meta "20%".
- Card "Metas de ahorro": monto ahorrado / objetivo total + barra de progreso.

**Pestaña Presupuesto:**
- Selector de mes.
- Card "Ingresos mensuales": filas editables (nombre + input numérico alineado a la derecha, color acento) + fila total (fondo acento, texto blanco).
- Card "Gastos presupuestados": por fila — nombre + input de monto presupuestado, debajo "Gasto real: $X — Y%" y barra de progreso (roja si se excede) + fila total (fondo ink, texto invertido).

**Pestaña Deudas:**
- KPIs: Deuda total, Pago mínimo total.
- Una card por deuda: nombre editable (input inline sin borde) + botón eliminar (✕); grid 2×2 de campos (Tipo [select], Estado [select], Saldo actual, Tasa mensual %, Pago mínimo, Pago que harás); pie con badge de estado (Al día=verde, Atrasado=rojo, Pagada=acento) + "X meses restantes" (calculado: saldo / pago que harás, redondeado hacia arriba).
- Botón "+ Agregar deuda" (fondo acento, full width).

**Pestaña Metas:**
- Una card por meta: nombre editable + eliminar; grid (Monto objetivo, Ahorrado, Fecha objetivo full-width); barra de progreso + "% ahorrado" y "faltan $X".
- Botón "+ Agregar meta".

**Pestaña Gastos:**
- KPIs: Hoy, Este mes.
- Card "Agregar gasto": Monto + Fecha (fila), Descripción, Categoría [select] + Medio de pago [select] (fila), botón "Agregar gasto".
- Historial agrupado por día ("Hoy", "Ayer", o fecha en formato `weekday, day mon`), cada grupo con su total; cada gasto: punto de color por categoría, descripción + "categoría · medio", monto en rojo, botón eliminar.

## Desktop App (vista independiente, 1280×760px de referencia, layout con sidebar)
**Estructura persistente:**
- **Sidebar** 236px fijo, fondo `cardAlt`, borde derecho: logo "F" + wordmark arriba; nav vertical de 5 ítems (mismos íconos que mobile, ítem activo = fondo `accentSoft` + texto acento); pie con avatar "I" (circular, fondo `accentSoft`), nombre "Ignacio" / "Cuenta personal", toggle de tema (versión chica 38×21px).
- **Topbar**: título de la pestaña activa (19px/800) + subtítulo "Panel de control financiero"; selector de mes a la derecha (mismo patrón `‹ mes ›` en card).
- **Contenido**: scrolleable, padding 26px 32px.

**Diferencias de layout vs. mobile (no es solo "mobile ensanchado"):**
- **Resumen**: KPIs en grid de **4 columnas** (una fila); debajo, tasa de ahorro y metas **lado a lado** (grid 2 columnas) en vez de apiladas.
- **Presupuesto**: Ingresos y Gastos en **2 columnas lado a lado** (no apiladas).
- **Deudas**: KPIs en 3 columnas (se agrega "Pago comprometido"); cards de deuda en **grid de 2 columnas**.
- **Metas**: cards de meta en **grid de 2 columnas**.
- **Gastos**: layout de 2 columnas — formulario "Agregar gasto" fijo a la izquierda (360px) + historial scrolleable a la derecha (más ancho, con más aire por fila).

## Interactions & Behavior
- **Navegación**: clic en ítem de nav (bottom nav mobile / sidebar desktop) cambia la pestaña activa sin recargar; el estado de datos se comparte entre ambas vistas.
- **Selector de mes**: botones `‹ ›` cambian solo la etiqueta de mes mostrada (en el prototipo es cosmético). **Implementar en real**: debe filtrar/recalcular gasto real y KPIs por el mes seleccionado.
- **Inputs de presupuesto/deuda/meta**: `onChange` actualiza el estado inmediatamente (no hay botón "guardar" separado); replicar con actualización inline + persistencia en backend (debounce recomendado).
- **Agregar gasto**: valida que el monto sea > 0 antes de agregar; limpia monto y descripción tras agregar, mantiene fecha/categoría/medio para agilizar carga de varios gastos seguidos.
- **Eliminar** (deuda, meta, gasto): botón "✕" elimina inmediatamente el ítem (sin confirmación en el prototipo — evaluar agregar confirmación en producción).
- **Toggle de tema**: persiste la preferencia entre pantallas (Login, Mobile, Desktop comparten el mismo estado de tema); implementar con `prefers-color-scheme` como default + guardado en localStorage/perfil de usuario.
- **Mostrar/ocultar contraseña**: alterna el `type` del input de password.
- Sin animaciones de transición complejas: solo `transition` cortas (0.15–0.2s) en hover de botones y en el desplazamiento del thumb del toggle de tema.

## State Management
Datos necesarios (por usuario, mensual donde aplique):
- `presupuesto`: lista de líneas `{ id, nombre, tipo: 'ingreso'|'gasto', monto }`.
- `deudas`: lista `{ id, nombre, tipo, saldo, tasaMensual, pagoMinimo, pagoComprometido, estado: 'Al día'|'Atrasado'|'Pagada' }`.
- `metas`: lista `{ id, nombre, objetivo, ahorrado, fechaObjetivo }`.
- `gastos`: lista `{ id, monto, fecha, descripcion, categoria, medioDePago }`.
- Derivados a calcular: total ingresos, total gasto presupuestado, gasto real (suma de `gastos` del mes filtrado por categoría/mes), saldo estimado, tasa de ahorro, deuda total, meses restantes por deuda, % de avance por meta.
- Sesión: `theme` ('light'|'dark'), pestaña activa, mes en vista.

## Assets
No se usan imágenes ni ilustraciones — todo es tipografía, color y unos pocos íconos SVG de línea (trazo, sin relleno, 2px) dibujados a mano en el prototipo: barras (resumen), billetera (presupuesto), tarjeta (deudas), diana (metas), recibo (gastos), más flechas `‹ ›` como texto. Recrear como set de íconos SVG del sistema de diseño elegido (o Bootstrap Icons, ya que el stack de destino es Bootstrap).

## Files
- `Finanzas App Design.dc.html` — prototipo interactivo completo (Login + Mobile + Desktop, con selector de vista y toggle de tema en vivo). Ábrelo en un navegador para ver/interactuar con el diseño real.
