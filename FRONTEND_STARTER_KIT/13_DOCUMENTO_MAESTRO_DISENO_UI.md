# Documento Maestro de Diseño Visual y Flujo de Aplicación: Exploradores de Valnor

## **1.0 Definiciones Visuales Globales (Guía de Estilo)**

### **1.1 Paleta de Colores "Valnor"**

| Nombre del Color       | HEX (Hexadecimal) | Uso Principal (Qué va Dónde) |
|------------------------|-------------------|--------------------------------|
| **Fondos Oscuros**     |                   |                                |
| Azul Ciber-Medianoche  | `#0A192F`         | Fondo principal de la aplicación, fondo de paneles de UI, modal de derrota. |
| Marrón de Cuero        | `#4E342E`         | Fondo secundario, tarjetas de inventario, elementos "medievales" (ej. botón Inventario). |
| **Acentos Neón (Energía)** |               |                                |
| Dorado Neón            | `#F5D10D`         | Acento Premium/Principal. Botones (Marketplace, Tienda), rangos SSS/Legendarios, recompensas de victoria, íconos de recursos (VAL, EVO). |
| Magenta Eléctrico      | `#E01E5A`         | Acento de Acción/Peligro. Botones (Mazmorras), daño crítico, alertas de error, barras de HP del enemigo. |
| Cian de Datos          | `#00B8D4`         | Acento de UI/Información. Botones (Personajes, Start), links, texto de "buffs", íconos informativos, barras de Maná/Energía. |
| **Texto y Neutros**    |                   |                                |
| Texto Claro            | `#E6F1FF`         | Texto principal. Números de stats, cuerpo de texto, descripciones de ítems. |
| Texto Secundario       | `#A8B2D1`         | Texto de apoyo. Logs de combate, texto de ayuda, placeholders. |
| Bordes (UI)            | `#303C55`         | Bordes de paneles, separadores, outlines de botones en reposo. |

### **1.2 Jerarquía Tipográfica "Valnor"**

| Fuente (Google Font) | Familia CSS       | Peso         | Uso Principal (Qué va Dónde) |
|----------------------|-------------------|--------------|-----------------------------|
| **Primaria: `Cinzel`** | `'Cinzel', serif` | **Bold (700)** | Títulos de Pantalla (LOBBY, INVENTARIO), Logo (Exploradores de Valnor). |
|                      |                   | **Black (900)** | Mensajes de Impacto (¡VICTORIA!, ¡DERROTA!). |
|                      |                   | **Regular (400)** | Botones de Navegación Principal (PERSONAJES, MAZMORRAS). |
| **Secundaria: `Exo 2`** | `'Exo 2', sans-serif` | **Bold (700)** | Barra de Recursos (VAL: 12500), Texto de Botones (START, Iniciar Sesión). |
|                      |                   | **SemiBold (600)**| Estadísticas y Números (ATK: 350, HP: 1500). |
|                      |                   | **Regular (400)** | Cuerpo de Texto (Descripciones, Logs), Nombres de Usuario (Usuario123). |

---

## **2.0 Flujo de Aplicación (El Juego)**

### **2.1 Pantalla de Inicio (Título)**

* **Propósito:** La primera pantalla de la aplicación. Limpia, épica y con una sola llamada a la acción.
* **Relación de Aspecto:** Horizontal (16:9).
* **Fondo:** El arte de portada principal (`Portada_16_9.webp`).
* **Elementos en Pantalla:**
    1. **Logo Central:**
        * **Contenido:** El ícono y texto "Exploradores de Valnor".
        * **Posición:** Centrado vertical y horizontalmente en la parte superior del botón START.
        * **Estilo:** Ícono superior con brillo `Dorado Neón`, texto `Exploradores de Valnor` (Fuente: `Cinzel Bold`, Color: `Dorado Neón`).
    2. **Botón "START":**
        * **Propósito:** Inicia el flujo del juego (Login/Registro si no hay sesión, Lobby si ya está autenticado).
        * **Posición:** Centrado horizontalmente en la parte inferior de la pantalla.
        * **Estilo:** Botón rectangular redondeado con borde y brillo interno `Cian de Datos`. Fondo del botón `Azul Ciber-Medianoche` semitransparente. Texto `START` (Fuente: `Exo 2 Bold`, Color: `Texto Claro`).
        * **Interactividad:** Efecto de *hover* con aumento de brillo `Cian de Datos`.
    3. **Botón de Configuración:**
        * **Componente:** Un ícono de engranaje `[⚙️]`.
        * **Posición:** Esquina superior derecha de la pantalla.
        * **Estilo:** Ícono `Cian de Datos` con un brillo sutil.
        * **Interactividad:** Al hacer clic, **abre el Modal de Configuración (ver 2.3)**.
    4. **Texto de Copyright:**
        * **Contenido:** "© 2025 Exploradores de Valnor. Press Start."
        * **Posición:** Esquina inferior central de la pantalla.
        * **Estilo:** Fuente `Exo 2 Regular`, Color `Texto Secundario`.

### **2.2 Pantalla de Login**

* **Propósito:** Autenticar a un jugador existente. Se accede al presionar "START" si no hay un token de sesión válido.
* **Fondo:** El arte de la portada, pero desenfocado (blurred) y oscurecido.
* **Elementos en Pantalla:**
    1. **Panel Central:** Un panel de "vidrio oscuro" (`Azul Ciber-Medianoche`) translúcido.
    2. **Logo:** El logo de "Exploradores de Valnor" en la parte superior del panel.
    3. **Campos de Texto:** (Fuente: `Exo 2`) "Email" y "Contraseña". Bordes `Cian de Datos`.
    4. **Botón Principal:** `[ Iniciar Sesión ]` (Fuente: `Exo 2 Bold`, Color: `Dorado Neón`).
    5. **Link Secundario:** "No tienes cuenta? Regístrate" (Fuente: `Exo 2`, Color: `Cian de Datos`).
    6. **Botón de Configuración:** Ícono `[⚙️]` en la esquina superior derecha.

---

## **3.0 Aplicación Principal (Después de Iniciar Sesión)**

### **3.1 UI Global Persistente (Barra Superior)**

* **Propósito:** Esta barra es visible en todas las pantallas de gestión (Lobby, Personajes, Inventario, Marketplace, Preparación de Mazmorra). NO es visible en la Pantalla de Inicio (Título) ni en la Pantalla de Combate.
* **Elementos (de izquierda a derecha):**
    1. **Barra Económica:** (Fuente: `Exo 2 Bold`, Color: `Texto Claro` con íconos `Dorado Neón`)
        * `[💰 VAL: 12500]`
        * `[🎟️ Boletos: 10]`
        * `[⚡ EVO: 5]`
    2. **Utilidades (Derecha):**
        * `[🔔 Notificaciones]` (Ícono de campana, con contador `Magenta Eléctrico`).
        * `[👤 Usuario123 ▼]` (Nombre de usuario, Fuente: `Exo 2 Regular`, Color: `Cian de Datos`).
        * `[⚙️ Configuración]` (Ícono de engranaje, Color: `Cian de Datos`). **Al hacer clic, abre el Modal de Configuración (ver 2.3).**

---

### **3.2 Pantalla de Lobby / Dashboard (El Hub Limpio)**

* **Propósito:** El hub de navegación principal. Limpio y directo. Es la primera pantalla que se ve tras el login.
* **Fondo:** Una vista inmersiva de la base de operaciones "Medieval Cyberpunk".
* **Elementos en Pantalla:**
    1. **UI Global Persistente (Barra Superior).**
    2. **Botones de Navegación Principal:** El único contenido central. 4 botones grandes y claros (Fuente: `Cinzel Regular`).
        * `[🗡️ PERSONAJES]` (Color: `Cian de Datos`)
        * `[📦 INVENTARIO]` (Color: `Marrón de Cuero` con borde `Dorado Neón`)
        * `[🏪 MARKETPLACE]` (Color: `Dorado Neón`)
        * `[⚔️ MAZMORRAS]` (Color: `Magenta Eléctrico`)

---

**¡Listo para implementar!** Este documento asegura que el diseño visual y el flujo de la aplicación sean coherentes y funcionales, optimizados para una experiencia inmersiva en orientación horizontal.