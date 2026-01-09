export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { mood } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
       return NextResponse.json({ error: "Chave não configurada" }, { status: 500 });
    }

    // AJUSTE PARA O GEMINI 3 FLASH PREVIEW
    // Como é uma versão Preview, voltamos para a rota 'v1beta' que é onde os testes ficam
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview", 
    }, { apiVersion: 'v1beta' }); 

    const prompt = `Você é o Espelho da Mente.
    Reflita sobre: ${mood}.

    REGRAS PARA O TEXTO:
    1. Escreva exatamente 8 frases longas (mínimo de 15 palavras cada).
    2. FOCO: Sem rimas. Use instruções de presença e respiração.
    3. ESTILO: Meditação guiada, tom calmo e profundo.
    4. PONTUAÇÃO PARA VOZ: Use vírgulas extras e reticências (...) entre ideias dentro da mesma frase para forçar pausas naturais na leitura.
    5. METÁFORAS: Use elementos do cosmos e da natureza.
    6. Separe as 4 frases apenas com o símbolo | .`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const phrases = text.split('|').map(p => p.trim()).filter(p => p.length > 5);

    return NextResponse.json({ phrases });
  } catch (error: any) {
    console.error("Erro no Gemini:", error);
    return NextResponse.json({ error: "O cosmos está em silêncio." }, { status: 500 });
  }
}