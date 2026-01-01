
import React, { useState } from 'react';
import { Joke, AppState, Language } from '../types';
import { speakText } from '../services/geminiService';

interface JokeDisplayProps {
  joke: Joke | null;
  state: AppState;
  showPunchline: boolean;
  onReveal: () => void;
  language: Language;
}

const translations = {
  [Language.ENGLISH]: {
    questionLabel: "Question:",
    answerLabel: "Answer:",
    emptyState: "Click the button to get a riddle!",
    revealButton: "I Give Up! Answer?",
    copy: "Copy",
    copied: "Copied!",
    share: "Share",
    speak: "Listen",
  },
  [Language.CHINESE]: {
    questionLabel: "問題：",
    answerLabel: "答案：",
    emptyState: "點擊按鈕來一條猜謎吧！",
    revealButton: "猜不到！看答案？",
    copy: "複製",
    copied: "已複製！",
    share: "分享",
    speak: "朗讀",
  }
};

const JokeDisplay: React.FC<JokeDisplayProps> = ({ joke, state, showPunchline, onReveal, language }) => {
  const t = translations[language];
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleSpeak = async () => {
    if (!joke || isSpeaking) return;
    setIsSpeaking(true);
    try {
      const textToSpeak = showPunchline ? `${joke.setup}... ${joke.punchline}` : joke.setup;
      const audioData = await speakText(textToSpeak);
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const dataInt16 = new Int16Array(audioData.buffer);
      const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }
      
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  const handleCopy = () => {
    if (!joke) return;
    const text = `${joke.setup}\n\nAnswer: ${joke.punchline}\n\nShared via MariYumcha`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!joke || !navigator.share) return;
    try {
      await navigator.share({
        title: 'MariYumcha Riddle',
        text: `${joke.setup}\n\nAnswer: ${joke.punchline}`,
        url: window.location.href,
      });
    } catch (err) {
      console.log('Share failed', err);
    }
  };

  if (state === AppState.LOADING) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">🤔</span>
        </div>
        <p className="text-indigo-300 font-medium animate-pulse">Finding fresh tea...</p>
      </div>
    );
  }

  if (!joke) {
    return (
      <div className="text-white/40 text-center italic py-20 text-lg border-2 border-dashed border-white/5 rounded-3xl">
        {t.emptyState}
      </div>
    );
  }

  return (
    <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-wrap justify-center gap-3">
        <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-black tracking-[0.2em] uppercase rounded-full shadow-lg shadow-indigo-500/5 animate-pulse">
          {joke.category}
        </span>
      </div>
      
      <div className="space-y-4 px-2">
        <p className="text-indigo-400/60 font-black uppercase tracking-[0.3em] text-[10px]">
          {t.questionLabel}
        </p>
        <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-xl">
          {joke.setup}
        </h2>
      </div>

      <div className="flex justify-center items-center gap-4 py-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
        <div className="flex gap-2">
          <button 
            onClick={handleSpeak}
            disabled={isSpeaking}
            className={`p-3 rounded-xl glass hover:bg-white/10 transition-all ${isSpeaking ? 'animate-pulse text-pink-400' : 'text-white/60 hover:text-white'}`}
            title={t.speak}
          >
            {isSpeaking ? '🔊' : '🔈'}
          </button>
          <button 
            onClick={handleCopy}
            className="p-3 rounded-xl glass hover:bg-white/10 transition-all text-white/60 hover:text-white"
            title={t.copy}
          >
            {isCopied ? '✅' : '📋'}
          </button>
          {navigator.share && (
            <button 
              onClick={handleShare}
              className="p-3 rounded-xl glass hover:bg-white/10 transition-all text-white/60 hover:text-white"
              title={t.share}
            >
              📤
            </button>
          )}
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
      </div>
      
      {showPunchline ? (
        <div className="animate-in zoom-in-90 fade-in duration-500 space-y-8">
          <div className="space-y-4">
            <p className="text-pink-400/60 font-black uppercase tracking-[0.3em] text-[10px]">
              {t.answerLabel}
            </p>
            <p className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-pink-200 to-indigo-400 drop-shadow-sm">
              {joke.punchline}
            </p>
          </div>
          <div className="flex justify-center gap-6 pt-4">
            <span className="text-5xl animate-bounce drop-shadow-2xl">😂</span>
            <span className="text-5xl animate-bounce [animation-delay:150ms] drop-shadow-2xl">🤣</span>
            <span className="text-5xl animate-bounce [animation-delay:300ms] drop-shadow-2xl">💀</span>
          </div>
        </div>
      ) : (
        <button
          onClick={onReveal}
          className="group relative inline-flex items-center gap-4 px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">💡</span>
          <span className="font-bold tracking-widest uppercase text-xs relative z-10">
            {t.revealButton}
          </span>
        </button>
      )}
    </div>
  );
};

export default JokeDisplay;
