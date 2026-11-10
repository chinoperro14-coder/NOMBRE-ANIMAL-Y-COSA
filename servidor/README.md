# Verificador con IA

Pequeño servidor (Cloudflare Worker, gratis) que recibe las respuestas de cada ronda y le pregunta a Claude si cada palabra existe, está bien escrita y es de la categoría correcta. La clave de Anthropic queda guardada en Cloudflare como secreto y nunca aparece en la página del juego.

## Instalación (sin usar la terminal)

1. **Clave de Anthropic**
   - Entra a https://console.anthropic.com, crea una cuenta y agrega crédito (Billing).
   - En *Limits*, pon un límite de gasto mensual bajo (por ejemplo 5 USD) para que nunca gaste más de eso.
   - En *API Keys*, crea una clave y cópiala.

2. **Cloudflare**
   - Crea una cuenta gratis en https://dash.cloudflare.com.
   - Ve a *Workers & Pages* → *Create* → *Import a repository* y conecta GitHub.
   - Elige el repositorio `NOMBRE-ANIMAL-Y-COSA`. En *Root directory* (o *Path*) escribe `servidor`. Despliega.
   - Cuando termine, abre el Worker → *Settings* → *Variables and Secrets* → *Add* → tipo **Secret**, nombre `ANTHROPIC_API_KEY`, valor: tu clave. Guarda.
   - Copia la dirección del Worker (termina en `.workers.dev`).

3. **Conectar el juego**
   - En `index.html`, pon esa dirección en `VERIFICADOR_URL` (o pásala a Claude para que lo haga).

Si el verificador falla o no está configurado, el juego sigue funcionando con las listas de `palabras.js` y los votos.

## Seguridad y costo
- Solo acepta solicitudes desde la página del juego (`chinoperro14-coder.github.io`). Si usas otro dominio, agrégalo en `ALLOWED_ORIGINS` dentro de `worker.js`.
- Cada ronda manda como máximo 150 palabras. El límite de gasto mensual de Anthropic es tu protección final.
