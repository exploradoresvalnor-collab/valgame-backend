# 🎮 DISEÑO DE PANTALLAS: VICTORIA Y DERROTA

> Este documento describe el diseño visual y funcional de las pantallas de **Victoria** y **Derrota** en el sistema de combate del juego.

---

## **Pantalla de Victoria**

### **Elementos Clave**
1. **Animación de Victoria:**
   - Fondo brillante con destellos y partículas.
   - Un cofre o regalo que "salta" y se abre para mostrar las recompensas.
   - Texto grande: "¡Victoria!" con efectos de luz.
2. **Log de Recompensas:**
   - Lista detallada de lo ganado:
     - **EXP** obtenida por cada personaje.
     - **VAL** ganado.
     - **Items** obtenidos (con íconos y rareza).
   - Estado final del equipo (HP restante).
3. **Progreso de Mazmorra:**
   - Barra de progreso que muestra los puntos acumulados.
   - Indicador de "Nivel Subido" si se alcanza el siguiente nivel.
   - Mensaje sobre cómo la mazmorra será más difícil en el próximo nivel.

### **Diseño Visual**
```
┌──────────────────────────────────────────────┐
│                  🎉 ¡VICTORIA! 🎉             │
│                                              │
│  [Animación de fondo con destellos y luces]  │
│                                              │
│  🎁 Cofre saltando y abriéndose...           │
│                                              │
│  Recompensas:                                │
│  ┌────────────────────────────────────────┐  │
│  │  💎 VAL: +120                          │  │
│  │  ⭐ EXP:                                │  │
│  │     - Héroe A: +660                    │  │
│  │     - Héroe B: +792 (con buff)         │  │
│  │     - Héroe C: +660                    │  │
│  │  📦 Items:                             │  │
│  │     - 🗡️ Espada del Dragón (Raro)      │  │
│  │     - 💊 Poción de Vida (Común)        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Estado del Equipo:                          │
│  ┌────────────────────────────────────────┐  │
│  │  Héroe A: ❤️ 900/1200                  │  │
│  │  Héroe B: ❤️ 600/900                   │  │
│  │  Héroe C: ❤️ 1500/1500                 │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Progreso de Mazmorra:                       │
│  ┌────────────────────────────────────────┐  │
│  │  Nivel Actual: 12 → 13                 │  │
│  │  Puntos Ganados: +150                  │  │
│  │  Progreso: ▓▓▓▓▓▓▓▓░░░░░░ 450/500      │  │
│  │  🎉 ¡Nivel Subido!                     │  │
│  │  Próximo Nivel: +15% dificultad        │  │
│  │                +10% recompensas        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [🏠 Volver a Mazmorras]  [⚔️ Continuar]     │
└──────────────────────────────────────────────┘
```

---

## **Pantalla de Derrota**

### **Elementos Clave**
1. **Animación de Derrota:**
   - Fondo oscuro con un efecto de sangre que gotea o se extiende.
   - Texto grande: "¡Has sido derrotado!" con un efecto de vibración o parpadeo.
2. **Estado del Equipo:**
   - Lista de héroes con su estado:
     - **Herido:** Barra de vida vacía con un temporizador de recuperación.
     - **Muerto:** Ícono de calavera y mensaje de "Revivir".
3. **Opciones de Revivir:**
   - Botón para revivir personajes muertos usando VAL.
   - Mensaje claro sobre el costo de revivir.
4. **Log de Combate:**
   - Resumen de lo que ocurrió en el combate (daño recibido, turnos, etc.).

### **Diseño Visual**
```
┌──────────────────────────────────────────────┐
│              💀 ¡HAS SIDO DERROTADO! 💀       │
│                                              │
│  [Fondo oscuro con efecto de sangre]         │
│                                              │
│  Estado del Equipo:                          │
│  ┌────────────────────────────────────────┐  │
│  │  Héroe A: ❤️ 0/1200 (Herido)           │  │
│  │  Héroe B: 💀 Muerto                    │  │
│  │  Héroe C: ❤️ 0/1500 (Herido)           │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Opciones:                                   │
│  ┌────────────────────────────────────────┐  │
│  │  💊 Revivir Héroe B: 50 VAL            │  │
│  │  ⏱️ Tiempo de recuperación: 24h        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Log de Combate:                             │
│  - Dragón inflige 200 de daño a Héroe A.     │
│  - Goblin inflige 150 de daño a Héroe B.     │
│  - Héroe B ha muerto.                        │
│                                              │
│  [🏠 Volver a Mazmorras]  [💊 Revivir Equipo] │
└──────────────────────────────────────────────┘
```

---

## **Animaciones y Efectos**

### **Pantalla de Victoria**
1. **Animación de Fondo:**
   - Destellos y partículas flotando.
   - Texto "¡Victoria!" con efecto de zoom y brillo.
2. **Cofre Saltando:**
   - El cofre "salta" y se abre para mostrar las recompensas.
   - Efectos de luz dorada al abrirse.
3. **Barra de Progreso:**
   - La barra se llena gradualmente para mostrar los puntos ganados.
   - Mensaje de "¡Nivel Subido!" si se alcanza el siguiente nivel.

### **Pantalla de Derrota**
1. **Fondo con Efecto de Sangre:**
   - Sangre que gotea o se extiende.
   - Oscurecimiento progresivo del fondo.
2. **Texto de Derrota:**
   - "¡Has sido derrotado!" vibra ligeramente y parpadea en rojo.
3. **Estado del Equipo:**
   - Héroes heridos con barras de vida vacías y temporizador.
   - Héroes muertos con íconos de calavera y opción de revivir.

---

## **Flujo de Usuario**

### **Pantalla de Victoria**
1. **Inicio:**
   - Muestra la animación de victoria.
   - El cofre salta y se abre para revelar las recompensas.
2. **Log de Recompensas:**
   - Lista detallada de lo ganado (EXP, VAL, items).
3. **Estado del Equipo:**
   - Muestra el HP restante de cada héroe.
4. **Progreso de Mazmorra:**
   - Actualiza la barra de progreso.
   - Si se sube de nivel:
     - Muestra un mensaje de "¡Nivel Subido!".
     - Indica cómo será más difícil el próximo nivel.
5. **Opciones:**
   - Botón para regresar a la lista de mazmorras.
   - Botón para continuar al siguiente combate.

### **Pantalla de Derrota**
1. **Inicio:**
   - Muestra el fondo con efecto de sangre.
   - Aparece el texto "¡Has sido derrotado!" con animaciones.
2. **Estado del Equipo:**
   - Lista de héroes con su estado (herido o muerto).
   - Temporizador para recuperación automática.
3. **Opciones de Revivir:**
   - Botón para revivir personajes muertos usando VAL.
   - Mensaje claro sobre el costo de revivir.
4. **Log de Combate:**
   - Resumen de lo que ocurrió en el combate.
5. **Opciones Finales:**
   - Botón para regresar a la lista de mazmorras.
   - Botón para revivir todo el equipo.

---

**¡Listo para implementar!** Este diseño asegura que las pantallas de victoria y derrota sean visualmente impactantes y funcionales, manteniendo la inmersión del jugador.