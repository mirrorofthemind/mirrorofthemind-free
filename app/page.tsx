'use client';
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, Loader2, RefreshCw, Clock, Download } from 'lucide-react';

export default function MirrorOfTheMind() {
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [lastAudioData, setLastAudioData] = useState<string[]>([]);
  
  const bgMusicRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const starElements = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3}px`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 5}s`
    }));
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (lastAudioData.length === 0) return;
    try {
      const link = document.createElement('a');
      link.href = `data:audio/mpeg;base64,${lastAudioData[0]}`;
      link.download = `reflexao-mirror-${new Date().getTime()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Não foi possível processar o download.");
    }
  };

  const handleContemplar = async () => {
    if (!reflection.trim()) return;
    
    setLoading(true);
    setShowResult(true);
    setCurrentTime(0);
    setIsPlaying(true);
    let fullText = "";
    let processedPhrases = 0;
  
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = 0.2;
      bgMusicRef.current.play().catch(() => {});
    }
  
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ mood: reflection }),
      });
  
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      // O cronômetro agora é uma estimativa
      setTotalDuration(60); 
      timerRef.current = setInterval(() => setCurrentTime(p => p + 1), 1000);
  
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
  
        fullText += decoder.decode(value, { stream: true });
        
        // Verifica se uma frase completa (com |) acabou de chegar
        const parts = fullText.split('|');
        
        // Se temos uma parte nova e completa para falar
        if (parts.length > processedPhrases + 1) {
          const phraseToSpeak = parts[processedPhrases].trim();
          if (phraseToSpeak.length > 5) {
            setLoading(false); // Tira o loading logo na primeira frase!
            await speakText(phraseToSpeak);
            processedPhrases++;
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
  
  // Função auxiliar para falar (coloque fora do handleContemplar)
  const speakText = (text: string) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.75;
      utterance.pitch = 0.85;
      utterance.onend = () => setTimeout(resolve, 3000); // Pausa após falar
      window.speechSynthesis.speak(utterance);
    });
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
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto" />
        </header>

        <audio ref={bgMusicRef} src="https://raw.githubusercontent.com/mirrorofthemind/public-musics/main/10%20Minutes%20of%20Relaxing%20Piano%20Music%20-%20Wawa%20(youtube).mp3" loop />

        <div className="w-full min-h-[400px] flex flex-col items-center justify-center">
          {!showResult ? (
            <div className="w-full space-y-8 animate-in fade-in zoom-in duration-700">
              <label className="block text-lg font-light text-purple-200 italic">
                {"O que sua mente reflete hoje?"} 
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                disabled={loading}
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-44 text-lg shadow-2xl transition-all"
                placeholder={"Compartilhe seus pensamentos..."}
              />
              <button
                onClick={handleContemplar}
                disabled={loading || !reflection}
                className="w-full py-5 rounded-full text-xl font-light tracking-[0.2em] bg-gradient-to-r from-purple-600 to-indigo-600 border border-white/10 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] transition-all disabled:opacity-30 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : "CONTEMPLAR"}
              </button>
            </div>
          ) : (
            <div className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-[2.5rem] space-y-8 animate-in zoom-in duration-500 shadow-2xl">
              <div className="space-y-3">
                <Sparkles className="mx-auto text-purple-300 animate-pulse" size={32} />
                <p className="text-purple-100 italic font-light tracking-wide">
                  {loading ? "Iniciando jornada..." : isPlaying ? "Em meditação..." : "Sessão concluída"}
                </p>
              </div>

              <div className="py-6 space-y-4">
                <div className="flex items-center justify-center gap-2 text-2xl font-mono text-purple-200">
                  <Clock size={20} className="text-purple-400" />
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-purple-400/50">/</span>
                  <span className="text-purple-400/50">{formatTime(totalDuration || 60)}</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-1000" style={{ width: `${totalDuration > 0 ? Math.min((currentTime / totalDuration) * 100, 100) : 0}%` }} />
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={handleDownload}
                  disabled={loading || isPlaying || lastAudioData.length === 0}
                  className="flex items-center justify-center gap-2 mx-auto px-6 py-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-all text-[10px] uppercase tracking-[0.2em] text-purple-200 disabled:opacity-20"
                >
                  <Download size={14} /> {"Baixar Reflexão"}
                </button>

                <button 
                  onClick={() => {
                    setShowResult(false); 
                    setReflection(""); 
                    setLastAudioData([]);
                    if (timerRef.current) clearInterval(timerRef.current);
                    if (bgMusicRef.current) { bgMusicRef.current.pause(); bgMusicRef.current.currentTime = 0; }
                  }} 
                  className="flex items-center justify-center gap-2 mx-auto text-[11px] uppercase tracking-[0.3em] text-purple-400/70 hover:text-white transition-colors"
                >
                  <RefreshCw size={14} /> {"Novo Reflexo"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .star { position: absolute; background: white; border-radius: 50%; opacity: 0.5; box-shadow: 0 0 10px rgba(255, 255, 255, 0.8); animation: twinkle linear infinite; }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
      `}</style>
    </div>
  );
}