# Chatbot Carreras – Instrucciones de despliegue

## Estructura del proyecto
```
chatbot-carreras/
├── api/
│   └── chat.js              ← función serverless (no tocar)
├── carreras/
│   └── ods2026.md           ← info de la carrera (editable)
├── widget-wordpress.html    ← código para pegar en WordPress
└── package.json
```

## PASO 1 — Obtener API Key de Gemini (gratis)
1. Ve a https://aistudio.google.com/apikey
2. Inicia sesión con tu cuenta de Google
3. Clic en "Create API Key" → copia la clave

## PASO 2 — Subir a Vercel
1. Sube este proyecto a un repositorio GitHub (igual que hiciste con el inventario)
2. En Vercel, importa ese repositorio
3. En Settings > Environment Variables, añade:
   - Nombre: `GEMINI_API_KEY`
   - Valor: la clave que copiaste en el paso 1
4. Despliega. Vercel te dará una URL tipo `https://chatbot-carreras-xxxx.vercel.app`

## PASO 3 — Pegar en WordPress
1. Abre `widget-wordpress.html`
2. Cambia la línea:
   `const VERCEL_URL = 'https://TU-PROYECTO.vercel.app';`
   por tu URL real de Vercel
3. En WordPress, ve a la página donde quieres el chatbot
4. Añade un bloque "HTML personalizado" y pega todo el contenido del archivo

## PARA AÑADIR UNA NUEVA CARRERA
1. Crea un nuevo archivo en `/carreras/` (ej: `trail2027.md`) con la misma estructura
2. Haz commit y push → Vercel redespliega automáticamente
3. En el widget del nuevo WordPress, cambia solo:
   `const NOMBRE_CARRERA = 'trail2027';`
4. El resto del código no cambia

## Límites gratuitos de Gemini 2.0 Flash
- 1.500 peticiones/día
- 1.000.000 tokens/minuto
- Más que suficiente para una carrera popular
