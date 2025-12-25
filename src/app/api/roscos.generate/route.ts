import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openrouter, getModel } from '@/server/ai/openrouter';
import { GenerateRoscosResponseSchema } from '@/server/ai/schemas';
import { validateItem } from '@/game/validation';
import { Question } from '@/game/types';

export async function POST(request: NextRequest) {
  try {
    const { theme, difficulty } = await request.json();

    const themeValue = theme?.trim() || 'CULTURA GENERAL';
    const difficultyValue = difficulty?.trim() || 'MEDIO';

    const prompt = `Actúa como un diseñador experto de juegos de palabras y trivia. Tu tarea es generar una base de datos de preguntas para el juego "Pasapalabra" (o "El Rosco").

Entradas de configuración:

Temática: ${themeValue}

Nivel de Dificultad: ${difficultyValue}

Instrucciones de generación de contenido:

Selección de Palabras:

Deben ser palabras que la gente reconozca (evita arcaísmos imposibles a menos que la dificultad sea "Experto").

Busca un equilibrio: ni insultantemente obvias, ni imposibles.

Regla de la letra: Para la mayoría de las letras, la palabra debe empezar por esa letra. Para letras difíciles (como la Ñ o la X), la palabra puede contener la letra.

Redacción de Definiciones:

Deben ser claras, directas y sin ambigüedades.

Evita que la definición contenga la raíz de la palabra respuesta (ej: no definas "Panadero" como "Persona que hace pan").

Adapta el tono a la temática elegida.

Estructura del Juego:

Debes generar dos roscos completos (roscoA y roscoB).

Cada rosco debe contener exactamente 27 objetos (De la A a la Z, incluyendo la Ñ).

El orden debe ser alfabético.

Formato de Salida (Estricto): Devuelve únicamente un objeto JSON válido. No añadas texto introductorio ni explicaciones fuera del JSON. Usa exactamente este esquema:

{
  "roscoA": [
    {
      "letter": "A",
      "answer": "Palabra",
      "description": "Definición clara aquí.",
      "condition": "Empieza por A"
    },
    {
      "letter": "Ñ",
      "answer": "Caña",
      "description": "Tallo de las plantas gramíneas, generalmente hueco y con nudos.",
      "condition": "Contiene la Ñ"
    }
    // ... completar resto del abecedario
  ],
  "roscoB": [
    // ... completar segundo set completo
  ]
}
Asegúrate de que el campo condition refleje la realidad (si la palabra empieza o contiene la letra).`;

    const result = await generateObject({
      model: openrouter(getModel()),
      schema: GenerateRoscosResponseSchema,
      prompt,
    });

    if (!result.object.roscoA || !result.object.roscoB) {
      return NextResponse.json(
        { error: 'Formato de respuesta inválido' },
        { status: 500 }
      );
    }

    // Validar y anotar items inválidos
    const processRosco = (rosco: Question[]): Question[] => {
      return rosco.map(item => {
        const valid = validateItem(item);
        if (!valid) {
          return {
            ...item,
            description: `⚠️ [ERROR IA: La palabra '${item.answer}' NO cumple '${item.condition}'] ${item.description}`,
          };
        }
        return item;
      });
    };

    const cleanRoscoA = processRosco(result.object.roscoA);
    const cleanRoscoB = processRosco(result.object.roscoB);

    return NextResponse.json({
      roscoA: cleanRoscoA,
      roscoB: cleanRoscoB,
    });
  } catch (error) {
    console.error('Error generating roscos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

