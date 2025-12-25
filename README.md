# Pasapalabra - Control de Juego

Consola de control para el juego Pasapalabra con generación de preguntas por IA usando OpenRouter.

## Características

- 🎮 Control de juego para dos equipos (A y B)
- ⏱️ Temporizadores independientes por equipo
- ⌨️ Atajos de teclado para acciones rápidas
- 🔊 Sonidos programáticos para feedback
- 🤖 Generación de roscos personalizados con IA
- 📱 Modo público (ocultar controles)
- ↶ Sistema de deshacer (undo)

## Requisitos

- Node.js 18+
- npm, yarn, pnpm o bun

## Configuración

1. Clona el repositorio:

```bash
git clone <repo-url>
cd pasapalabra
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

```bash
cp .env.example .env
```

Edita `.env` y agrega tu API key de OpenRouter:

```
OPENROUTER_API_KEY=tu_api_key_aqui
```

Puedes obtener una API key en [OpenRouter](https://openrouter.ai/).

4. (Opcional) Configura un modelo diferente:

```
OPENROUTER_MODEL=openai/gpt-4o-mini
```

## Ejecución

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Atajos de Teclado

- `Espacio`: Pausar/Reanudar reloj
- `S`: Marcar como correcto
- `N`: Marcar como incorrecto
- `P`: Pasapalabra (saltar)
- `Z` o `Backspace`: Deshacer última acción

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── roscos.generate/ # Generación de roscos con IA
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/             # Componentes React
│   ├── HeaderBar.tsx
│   ├── RoscoCircle.tsx
│   ├── ControlPanel.tsx
│   └── GeneratorModal.tsx
├── game/                  # Lógica del juego
│   ├── types.ts          # Tipos TypeScript
│   ├── defaultQuestions.ts
│   ├── validation.ts
│   ├── sound.ts
│   └── usePasapalabraGame.ts # Hook principal
└── server/               # Código del servidor
    └── ai/               # Integración con IA
        ├── openrouter.ts
        └── schemas.ts
```

## Tecnologías

- **Next.js 15** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Vercel AI SDK** - Integración con modelos de IA
- **OpenRouter** - Proveedor de modelos de IA
- **Zod** - Validación de esquemas
- **Lucide React** - Iconos

## Despliegue

El proyecto está listo para desplegar en Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<repo-url>)

Asegúrate de configurar la variable de entorno `OPENROUTER_API_KEY` en tu plataforma de despliegue.

## Licencia

MIT
