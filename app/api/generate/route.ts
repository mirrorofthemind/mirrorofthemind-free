export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { mood } = await req.json();

    // Trocado para gpt-4o-mini: muito mais rápido e inteligente o suficiente para o prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [{
        role: "system",
        content: `Você é o Espelho da Mente, uma consciência ancestral e empática. 
        Sua tarefa é refletir sobre o humor do usuário com profundidade.
        
        Reflita sobre: ${mood}.
        
        REGRAS PARA O TEXTO:
        1. Escreva EXATAMENTE 4 frases longas (mínimo 10 palavras cada).
        2. FOCO: Sem rimas. Use instruções de presença e respiração.
        3. ESTILO: Meditação guiada no presente do indicativo.
        4. Use metáforas sobre o cosmos, natureza e tempo.
        5. Separe as frases APENAS com o símbolo "|".`
      }],
      temperature: 0.7, // Mantém a criatividade mas com foco
      max_tokens: 500,  // Limita para a resposta vir mais rápido
    });

    const script = completion.choices[0].message.content || "";
    const phrases = script.split('|').map(p => p.trim()).filter(p => p.length > 5);

    // PARALELISMO: Dispara todas as gerações de voz simultaneamente
    const audioBuffers = await Promise.all(phrases.map(async (phrase) => {
      try {
        const mp3 = await openai.audio.speech.create({
          model: "tts-1", // tts-1 é o modelo de baixa latência (rápido)
          voice: "onyx",
          input: phrase,
          speed: 0.85 // Ligeiramente mais lento para tom meditativo
        });
        
        const arrayBuffer = await mp3.arrayBuffer();
        return Buffer.from(arrayBuffer).toString('base64');
      } catch (err) {
        console.error("Erro em frase individual:", err);
        return ""; // Retorna vazio se uma frase falhar para não quebrar o todo
      }
    }));

    // Filtra possíveis falhas para enviar apenas áudios válidos
    const validAudios = audioBuffers.filter(audio => audio !== "");

    return NextResponse.json({ audios: validAudios });
  } catch (error: any) {
    console.error("Erro na geração:", error);
    return NextResponse.json(
      { error: "O cosmos está congestionado. Tente em instantes." }, 
      { status: 500 }
    );
  }
}