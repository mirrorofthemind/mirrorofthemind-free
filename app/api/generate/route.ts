export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Forçamos a biblioteca a usar a versão estável da API do Google
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { mood } = await req.json();

    // Verificação da chave
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
       return NextResponse.json({ error: "Chave não configurada" }, { status: 500 });
    }

    // Mudança estratégica: usamos o modelo 1.5-flash-8b (mais leve e compatível)
    // E adicionamos uma configuração para garantir a versão estável
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    }, { apiVersion: 'v1' }); // <--- ISSO FORÇA A VERSÃO ESTÁVEL

    const prompt = `Você é o Espelho da Mente. Reflita sobre: ${mood}.
    REGRAS: Escreva 4 frases meditativas separadas por | .`;

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