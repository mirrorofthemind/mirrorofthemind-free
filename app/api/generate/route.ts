export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializa o Gemini com a chave que você colocou na Vercel
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { mood } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
    }

    // USANDO O MODELO FLASH (Substitui o gemini-pro que deu erro 404)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Você é o Espelho da Mente. Reflita sobre: ${mood}.
    REGRAS: 
    1. Escreva exatamente 4 frases longas e meditativas. 
    2. Use metáforas sobre o tempo e o cosmos.
    3. Separe as frases apenas com o símbolo | .`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Transforma o texto em uma lista de frases para o celular ler
    const phrases = text.split('|').map(p => p.trim()).filter(p => p.length > 5);

    return NextResponse.json({ phrases });
  } catch (error: any) {
    console.error("Erro no Gemini:", error);
    return NextResponse.json({ error: "O cosmos está em silêncio." }, { status: 500 });
  }
}