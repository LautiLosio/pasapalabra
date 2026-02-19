import { NextRequest, NextResponse } from "next/server";
import { generateText, generateObject, APICallError } from "ai";
import { openrouter, getModel } from "@/server/ai/openrouter";
import { GenerateRoscosResponseSchema } from "@/server/ai/schemas";
import { validateItem } from "@/game/validation";
import { Question } from "@/game/types";

/** Models that only support json_object (not json_schema) - use generateText + json() output */
const JSON_OBJECT_ONLY_MODELS = ["stepfun/step-3.5-flash", "stepfun/step-3"];

export async function POST(request: NextRequest) {
  try {
    const { theme, difficulty, playerCount } = await request.json();

    const themeValue = theme?.trim() || "CULTURA GENERAL";
    const difficultyValue = difficulty?.trim() || "MEDIO";
    const playerCountValue = Math.max(
      2,
      Math.min(10, parseInt(playerCount) || 2)
    );

    const difficultyGuide: Record<string, string> = {
      FÁCIL: `
   - Usa palabras de uso cotidiano que cualquier persona conozca.
   - Ejemplos válidos: "Amistad", "Biblioteca", "Camino", "Dormir".
   - Las definiciones deben ser claras y directas.`,
      MEDIO: `
   - Usa palabras de CONOCIMIENTO COMÚN para personas con educación secundaria.
   - El 80% deben ser palabras reconocibles al escucharlas (aunque requieran pensar).
   - Solo el 20% pueden ser términos más específicos o de nicho temático.
   - Ejemplos válidos: "Armonía", "Bóveda", "Cordillera", "Democracia", "Enigma", "Fiesta".
   - EVITA: Tecnicismos oscuros, arcaísmos, palabras que solo un especialista conocería.`,
      DIFÍCIL: `
   - Usa vocabulario culto y términos especializados.
   - Palabras que requieran cultura general amplia o conocimiento de la temática.
   - Ejemplos válidos: "Alianza", "Bitácora", "Catarsis", "Dicotomía", "Efímero", "Fauna".`,
      EXPERTO: `
   - Vocabulario técnico, arcaísmos, y términos de uso muy específico.
   - Palabras que solo un experto o erudito reconocería fácilmente.
   - Ejemplos válidos: "Antonomasia", "Baluarte", "Circunloquio", "Diatriba", "Frugal".`,
    };

    const selectedGuide =
      difficultyGuide[difficultyValue] || difficultyGuide["MEDIO"];

    const prompt = `Actúa como diseñador experto de trivias para el juego "Pasapalabra".

### CONFIGURACIÓN
- Temática: ${themeValue}
- Dificultad: ${difficultyValue}
- Cantidad de Roscos: ${playerCountValue}

### GUÍA DE DIFICULTAD "${difficultyValue}"
${selectedGuide}

### REGLAS DE SELECCIÓN
1. **Unicidad:** No repitas palabras entre los ${playerCountValue} roscos.
2. **Letras difíciles (Ñ, X, Q, Y):** Si no hay palabra común, usa "Contiene".
3. **Balance:** La mayoría de palabras deben ser acertables por el público objetivo de esta dificultad.

### REGLAS DE REDACCIÓN
1. En caso que consideres necesario, puedes indicar categoría gramatical para evitar ambigüedades sobre la palabra a definir: "[Sustantivo]...", "[Verbo]...", etc.
2. No uses la raíz de la palabra en la definición.
3. La definición debe ser precisa pero comprensible.

### FORMATO JSON (solo devuelve el JSON)
{
  "roscos": [
    [
      {
        "letter": "A",
        "answer": "Alianza",
        "description": "Pacto o unión entre personas, grupos o naciones para un fin común.",
        "condition": "Empieza por A"
      },
      {
        "letter": "Ñ",
        "answer": "Pañuelo",
        "description": "[Sustantivo] Trozo de tela usado para limpiarse o como accesorio.",
        "condition": "Contiene la Ñ"
      }
    ]
  ]
}`;

    const modelId = getModel();
    const useJsonObjectOnly = JSON_OBJECT_ONLY_MODELS.some((m) =>
      modelId.toLowerCase().startsWith(m.toLowerCase())
    );

    let object: { roscos: Question[][] };

    if (useJsonObjectOnly) {
      // StepFun etc. don't support response_format - use plain text and parse JSON manually.
      const { text } = await generateText({
        model: openrouter(modelId),
        prompt,
        maxOutputTokens: 16384, // 27 letters × N roscos × ~80 chars each ≈ 4k+ tokens
      });
      const raw = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return NextResponse.json(
          { error: "Formato de respuesta inválido" },
          { status: 500 }
        );
      }
      const parsedResult = GenerateRoscosResponseSchema.safeParse(parsed);
      if (!parsedResult.success) {
        return NextResponse.json(
          { error: "Formato de respuesta inválido" },
          { status: 500 }
        );
      }
      object = parsedResult.data;
    } else {
      const result = await generateObject({
        model: openrouter(modelId),
        schema: GenerateRoscosResponseSchema,
        prompt,
        maxOutputTokens: 16384,
      });
      object = result.object;
    }

    if (!object.roscos || !Array.isArray(object.roscos)) {
      return NextResponse.json(
        { error: "Formato de respuesta inválido" },
        { status: 500 }
      );
    }

    if (object.roscos.length !== playerCountValue) {
      return NextResponse.json(
        {
          error: `Se esperaban ${playerCountValue} roscos, se recibieron ${object.roscos.length}`,
        },
        { status: 500 }
      );
    }

    // Validar y anotar items inválidos
    const processRosco = (rosco: Question[]): Question[] => {
      return rosco.map((item) => {
        const valid = validateItem(item);
        if (!valid) {
          return {
            ...item,
            description: `[ERROR IA: La palabra '${item.answer}' NO cumple '${item.condition}'] ${item.description}`,
          };
        }
        return item;
      });
    };

    const cleanRoscos = object.roscos.map((rosco: Question[]) =>
      processRosco(rosco)
    );

    return NextResponse.json({ roscos: cleanRoscos });
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : "Error desconocido";

    if (APICallError.isInstance(error)) {
      // OpenRouter/API errors: use responseBody (provider's data is schema-stripped, lacks metadata)
      try {
        const parsed = error.responseBody
          ? (JSON.parse(error.responseBody) as {
              error?: { message?: string; metadata?: { raw?: string } };
            })
          : null;
        let msg = parsed?.error?.message;
        const rawMeta = parsed?.error?.metadata?.raw;
        if (rawMeta && msg === "Provider returned error") {
          try {
            const inner = JSON.parse(rawMeta) as { error?: { message?: string } };
            msg = inner?.error?.message ?? rawMeta;
          } catch {
            msg = rawMeta;
          }
        }
        if (msg) errorMessage = msg;
      } catch {
        const data = error.data as { error?: { message?: string } } | undefined;
        if (data?.error?.message) errorMessage = data.error.message;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
