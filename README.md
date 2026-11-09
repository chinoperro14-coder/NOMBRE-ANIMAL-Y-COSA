# Nombre, Animal y Cosa

Juego multijugador en línea tipo "Basta / Stop". Un jugador crea una sala, comparte el link y todos llenan las categorías con la letra de la ronda antes de que se acabe el tiempo.

## Cómo jugar
1. Abre la página, escribe tu nombre y toca **Crear sala**.
2. Comparte el link o el código de 5 letras con tus amigos.
3. El anfitrión elige categorías, tiempo y reglas, y toca **Empezar ronda**.
4. Cualquiera puede decir **¡Basta!** cuando haya llenado todas las categorías.

## Categorías
Nombre, Animal, Cosa, Color, Fruta, País, Marca, Almacén y TV (el anfitrión puede cambiarlas).

## Puntos
- Palabra única: 100. Repetida: 50, 25, 12.5… (o 100 entre N, según el anfitrión).
- Vacía, con otra letra, fuera de la lista de palabras o rechazada por votos: 0.
- Quien salga del juego (otra app o pestaña) durante la ronda pierde los puntos de esa ronda.

## Archivos
- `index.html`: el juego completo.
- `palabras.js`: listas de palabras del verificador. Agrega palabras separadas por comas.

Para probar solo en tu computadora con varias pestañas: abre `index.html?modo=local`.
