'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, Loader2, RefreshCw, Clock } from 'lucide-react';

export default function MirrorOfTheMind() {
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  
  const bgMusicRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    // Carrega as vozes na memória (importante para Chrome/Safari)
    window.speechSynthesis.getVoices();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const starElements = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3}px`, duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 5}s`
    }));
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- FUNÇÃO DE VOZ (MELHORADA) ---
  const speakText = (text: string) => {
    return new Promise((resolve) => {
      // Cancela falas anteriores para não encavalar
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      // Busca vozes mais humanas
      const premiumVoice = voices.find(v => 
        v.lang.startsWith('pt') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
      ) || voices.find(v => v.lang.startsWith('pt'));

      if (premiumVoice) utterance.voice = premiumVoice;
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8; 
      utterance.pitch = 0.9;

      utterance.onend = () => setTimeout(resolve, 3000);
      utterance.onerror = () => resolve(null);
      
      window.speechSynthesis.speak(utterance);
    });
  };

  const handleContemplar = async () => {
    if (!reflection.trim()) return;

    // DESBLOQUEIO PARA MOBILE: Fala um silêncio no clique
    const unlock = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(unlock);

    setLoading(true);
    setShowResult(true);
    setCurrentTime(0);
    setIsPlaying(true);
    let fullText = "";
    let processedPhrases = 0;

    if (bgMusicRef.current) {
      bgMusicRef.current.volume = 0.15;
      bgMusicRef.current.play().catch(() => {});
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ mood: reflection }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      setTotalDuration(60); 
      timerRef.current = setInterval(() => setCurrentTime(p => p + 1), 1000);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          fullText += decoder.decode(value, { stream: true });
          const parts = fullText.split('|');
          
          if (parts.length > processedPhrases + 1) {
            const phraseToSpeak = parts[processedPhrases].trim();
            if (phraseToSpeak.length > 5) {
              setLoading(false);
              await speakText(phraseToSpeak);
              processedPhrases++;
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#0f0c29] text-white p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] z-0" />
      <div className="absolute inset-0 z-1 pointer-events-none">
        {starElements.map((star) => (
          <div key={star.id} className="star" style={{ top: star.top, left: star.left, width: star.size, height: star.size, animationDuration: star.duration, animationDelay: star.delay }} />
        ))}
      </div>

      <main className="z-10 w-full max-w-md flex flex-col items-center text-center space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extralight tracking-[0.3em] uppercase drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            Mirror <span className="block font-medium mt-2">{"of the mind"}</span>
          </h1>
        </header>

        <audio ref={bgMusicRef} src="https://raw.githubusercontent.com/mirrorofthemind/public-musics/main/10%20Minutes%20of%20Relaxing%20Piano%20Music%20-%20Wawa%20(youtube).mp3" loop />

        <div className="w-full min-h-[400px] flex flex-col items-center justify-center">
          {!showResult ? (
            <div className="w-full space-y-8 animate-in fade-in zoom-in duration-700">
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                disabled={loading}
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-44 text-lg"
                placeholder="Compartilhe seus pensamentos..."
              />
              <button
                onClick={handleContemplar}
                disabled={loading || !reflection}
                className="w-full py-5 rounded-full text-xl font-light tracking-[0.2em] bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg disabled:opacity-30 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : "CONTEMPLAR"}
              </button>
            </div>
          ) : (
            <div className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-[2.5rem] space-y-8 animate-in zoom-in">
              <div className="space-y-3">
                <Sparkles className="mx-auto text-purple-300 animate-pulse" size={32} />
                <p className="text-purple-100 italic font-light">
                  {loading ? "Iniciando jornada..." : isPlaying ? "Em meditação..." : "Sessão concluída"}
                </p>
              </div>

              <div className="py-6 space-y-4">
                <div className="flex items-center justify-center gap-2 text-2xl font-mono text-purple-200">
                  <Clock size={20} />
                  <span>{formatTime(currentTime)}</span>
                </div>
              </div>

              <button 
                onClick={() => { setShowResult(false); setReflection(""); if (bgMusicRef.current) bgMusicRef.current.pause(); window.speechSynthesis.cancel(); }} 
                className="flex items-center justify-center gap-2 mx-auto text-[11px] uppercase tracking-[0.3em] text-purple-400"
              >
                <RefreshCw size={14} /> NOVO REFLEXO
              </button>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .star { position: absolute; background: white; border-radius: 50%; opacity: 0.5; animation: twinkle linear infinite; }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
      `}</style>
    </div>
  );
}