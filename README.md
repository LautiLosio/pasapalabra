# Pasapalabra - Control de Juego

Sé el presentador de tu propio juego de Pasapalabra. Controla la partida, gestiona las respuestas y dirige el juego como anfitrión. Incluye generación de preguntas por IA usando OpenRouter.

## Características

- 🎮 Control de juego para dos equipos
- ⏱️ Temporizadores independientes por equipo
- ⌨️ Atajos de teclado para acciones rápidas
- 🔊 Sonidos programáticos para feedback
- 🤖 Generación de roscos personalizados con IA
- 📱 Modo público (ocultar controles)
- ↶ Sistema de deshacer (undo)

## Requisitos

- Node.js 20+
- npm, yarn, pnpm o bun

## Configuración

1. Clona el repositorio:

```bash
git clone https://github.com/LautiLosio/pasapalabra
cd pasapalabra
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

Crea un archivo `.env` en la raíz del proyecto y agrega tu API key de OpenRouter:

```
OPENROUTER_API_KEY=tu_api_key_aqui
```

Puedes obtener una API key en [OpenRouter](https://openrouter.ai/).

4. (Opcional) Configura un modelo diferente:

```
OPENROUTER_MODEL=openai/gpt-4o-mini
```

Por defecto se usa `mistralai/devstral-2512:free`.

## Ejecución

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Atajos de Teclado

- `Espacio`: Pausar/Reanudar reloj
- `Flecha Derecha` o `A`: Marcar como correcto
- `Flecha Izquierda` o `F`: Marcar como incorrecto
- `Flecha Abajo` o `P`: Pasapalabra (saltar)
- `Z` o `Backspace`: Deshacer última acción
- `Escape` o `I`: Ocultar/Mostrar controles
- `M`: Activar/Desactivar sonidos

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
│   ├── GeneratorModal.tsx
│   ├── SettingsModal.tsx
│   ├── InfoModal.tsx
│   └── EditablePlayerName.tsx
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

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Vercel AI SDK** - Integración con modelos de IA
- **OpenRouter** - Proveedor de modelos de IA
- **Zod** - Validación de esquemas
- **Lucide React** - Iconos
- **Motion** - Animaciones

## Despliegue

El proyecto está listo para desplegar en Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LautiLosio/pasapalabra)

Asegúrate de configurar la variable de entorno `OPENROUTER_API_KEY` en tu plataforma de despliegue.

## Licencia

MIT
