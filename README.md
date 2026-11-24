# TechNova

Tienda tecnológica moderna creada con React, Vite y Supabase.

## Desarrollo local

```powershell
npm install
npm run dev
```

## Configurar Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta el contenido de `supabase.sql` en el editor SQL.
3. Copia `.env.example` como `.env.local`.
4. Define `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

Sin variables de entorno, la tienda funciona con datos de demostración y los cambios se guardan en el navegador.

## Publicar en Vercel

1. Sube el proyecto a GitHub.
2. Importa el repositorio desde Vercel.
3. Agrega las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Despliega el proyecto.
