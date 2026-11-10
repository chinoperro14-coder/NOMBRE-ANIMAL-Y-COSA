// Verificador de palabras con Claude para "Nombre, Animal y Cosa".
// Se publica gratis en Cloudflare Workers. La clave de Anthropic se guarda como secreto
// (ANTHROPIC_API_KEY) en Cloudflare: nunca está en la página del juego.
import Anthropic from "@anthropic-ai/sdk";

const ALLOWED_ORIGINS = [
  "https://chinoperro14-coder.github.io",
  "http://localhost:8765",
];
const MAX_ITEMS = 150;
const MAX_LEN = 40;

const SYSTEM = `Eres el juez de un juego de "Nombre, Animal y Cosa" (también llamado Basta o Stop) en español latinoamericano.
Recibes la letra de la ronda y una lista de respuestas, cada una con su categoría.
Para cada respuesta decide si es VÁLIDA:
- Debe existir de verdad (no inventada) y pertenecer a esa categoría.
- Debe empezar con la letra de la ronda.
- Acepta faltas de acentos y mayúsculas, plurales y variantes regionales (México, Argentina, Chile, España, etc.).
- Si está mal escrita (más allá de acentos), NO es válida; indica la forma correcta en "correccion".
Guía de categorías: Nombre = nombre de pila de persona; Apellido = apellido real; Animal = cualquier especie o tipo de animal;
Cosa = objeto concreto; Color = color o tono reconocido; Fruta = fruta (acepta verduras solo si la categoría dice verdura);
País = país (acepta ciudades solo si la categoría dice ciudad); Marca = marca comercial real; Almacén = producto que se compra
en un almacén o supermercado; TV = programa, serie, canal o personaje de televisión. Para categorías no listadas, usa el sentido común.
Sé justo: ante una duda razonable, acepta. Escribe "motivo" en español, en pocas palabras.`;

const SCHEMA = {
  type: "object",
  properties: {
    resultados: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          valida: { type: "boolean" },
          motivo: { type: "string" },
          correccion: { type: "string" },
        },
        required: ["id", "valida", "motivo", "correccion"],
        additionalProperties: false,
      },
    },
  },
  required: ["resultados"],
  additionalProperties: false,
};

function cors(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}
const json = (data, status, headers) =>
  new Response(JSON.stringify(data), { status, headers: { ...headers, "Content-Type": "application/json" } });

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = cors(origin);
    if (request.method === "OPTIONS") return new Response(null, { headers });
    if (request.method !== "POST") return json({ error: "Usa POST" }, 405, headers);
    if (!ALLOWED_ORIGINS.includes(origin)) return json({ error: "Origen no permitido" }, 403, headers);

    let body;
    try { body = await request.json(); } catch { return json({ error: "JSON inválido" }, 400, headers); }
    const letra = String(body.letra || "").slice(0, 1).toUpperCase();
    const items = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [];
    if (!letra || !items.length) return json({ error: "Faltan letra o items" }, 400, headers);
    const lista = items.map((it, i) => ({
      id: i,
      categoria: String(it.categoria || "").slice(0, MAX_LEN),
      palabra: String(it.palabra || "").slice(0, MAX_LEN),
    }));

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    try {
      const response = await client.beta.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 16000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
        system: SYSTEM,
        messages: [{
          role: "user",
          content: `Letra de la ronda: ${letra}\nRespuestas (JSON):\n${JSON.stringify(lista)}`,
        }],
      });
      if (response.stop_reason === "refusal") return json({ error: "La IA no pudo revisar esta ronda" }, 502, headers);
      const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
      const parsed = JSON.parse(text);
      return json({ resultados: parsed.resultados }, 200, headers);
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) return json({ error: "Demasiadas solicitudes, intenta luego" }, 429, headers);
      if (error instanceof Anthropic.AuthenticationError) return json({ error: "Clave de Anthropic inválida" }, 500, headers);
      if (error instanceof Anthropic.APIError) return json({ error: `Error de la IA (${error.status})` }, 502, headers);
      return json({ error: "Error al revisar" }, 500, headers);
    }
  },
};
