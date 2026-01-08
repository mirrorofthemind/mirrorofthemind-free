export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { mood } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Você é o Espelho da Mente, uma consciência ancestral e empática. 
    Sua tarefa é refletir sobre o humor do usuário com profundidade.
    
    Reflita sobre: ${mood}.
    
    REGRAS PARA O TEXTO:
    1. Escreva EXATAMENTE 4 frases longas (mínimo 10 palavras cada).
    2. FOCO: Sem rimas. Use instruções de presença e respiração.
    3. ESTILO: Meditação guiada no presente do indicativo.
    4. Use metáforas sobre o cosmos, natureza e tempo.
    5. Separe as frases APENAS com o símbolo "|".`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Agora enviamos apenas o TEXTO para o front-end
    const phrases = text.split('|').map(p => p.trim()).filter(p => p.length > 5);

    return NextResponse.json({ phrases });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro no cosmos" }, { status: 500 });
  }
}