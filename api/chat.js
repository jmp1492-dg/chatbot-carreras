import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // CORS para que WordPress pueda llamar a esta API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { pregunta, carrera } = req.body;

  if (!pregunta || !carrera) {
    return res.status(400).json({ error: 'Faltan parámetros: pregunta y carrera' });
  }

  // Cargar el archivo de configuración de la carrera
  const configPath = path.join(process.cwd(), 'carreras', `${carrera}.md`);
  if (!fs.existsSync(configPath)) {
    return res.status(404).json({ error: `No se encontró la carrera: ${carrera}` });
  }
  const contexto = fs.readFileSync(configPath, 'utf-8');

  // Llamada a Gemini 2.0 Flash (gratuito)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `Eres el asistente oficial de la carrera "${carrera}". 
Responde ÚNICAMENTE con la información que aparece en el siguiente documento de la carrera.
Si la información solicitada aparece como "por determinar" o no está en el documento, dilo claramente y sugiere consultar la web oficial.
Responde siempre en español, de forma amable, breve y directa. No inventes datos.

--- INFORMACIÓN DE LA CARRERA ---
${contexto}
--- FIN DE LA INFORMACIÓN ---

Pregunta del participante: ${pregunta}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 300, temperature: 0.2 }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    return res.status(500).json({ error: 'Error en Gemini API', detalle: err });
  }

  const data = await response.json();
  const respuesta = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No he podido generar una respuesta.';

  return res.status(200).json({ respuesta });
}
