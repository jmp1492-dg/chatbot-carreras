import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { pregunta, carrera } = req.body;
  if (!pregunta || !carrera) {
    return res.status(400).json({ error: 'Faltan parámetros: pregunta y carrera' });
  }

  const configPath = path.join(__dirname, '..', 'carreras', `${carrera}.md`);
  if (!fs.existsSync(configPath)) {
    return res.status(404).json({ error: `No se encontró la carrera: ${carrera}` });
  }
  const contexto = fs.readFileSync(configPath, 'utf-8');

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://chatbot-carreras-pi.vercel.app',
      'X-Title': 'Chatbot Carreras'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-exp:free',
      max_tokens: 300,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: `Eres el asistente oficial de la carrera. Responde ÚNICAMENTE con la información del siguiente documento. Si algo aparece como "por determinar" o no está en el documento, dilo claramente y sugiere consultar la web oficial. Responde en español, de forma amable, breve y directa. No inventes datos.\n\n--- INFORMACIÓN DE LA CARRERA ---\n${contexto}\n--- FIN ---`
        },
        {
          role: 'user',
          content: pregunta
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    return res.status(500).json({ error: 'Error en OpenRouter API', detalle: err });
  }

  const data = await response.json();
  const respuesta = data.choices?.[0]?.message?.content || 'No he podido generar una respuesta.';
  return res.status(200).json({ respuesta });
}
