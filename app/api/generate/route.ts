export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { mood } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }, { apiVersion: 'v1beta' });

    const prompt = `Você é o Espelho da Mente.
    Reflita sobre: ${mood}.

    REGRAS PARA O TEXTO:
    1. Escreva exatamente 4 frases longas (mínimo de 15 palavras cada).
    2. FOCO: Sem rimas. Use instruções de presença e respiração.
    3. ESTILO: Meditação guiada, tom calmo e profundo.
    4. PONTUAÇÃO PARA VOZ: Use vírgulas extras e reticências (...) entre ideias dentro da mesma frase para forçar pausas naturais na leitura.
    5. METÁFORAS: Use elementos do cosmos e da natureza.
    6. Separe as 4 frases apenas com o símbolo | .`;

    // Usamos STREAM aqui para ser mais rápido
    const result = await model.generateContentStream(prompt);
    
    // Criamos um fluxo de resposta para o navegador
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    return new Response(stream);
  } catch (error) {
    return NextResponse.json({ error: "Erro no fluxo" }, { status: 500 });
  }
}