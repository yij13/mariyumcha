
import React, { useState, useCallback, useEffect } from 'react';
import { fetchRandomJoke } from './services/geminiService';
import { Joke, AppState, Language } from './types';
import JokeDisplay from './components/JokeDisplay';

const translations = {
  [Language.ENGLISH]: {
    title: "MariYumcha",
    subtitle: "Premium Malaysian Guessing Game",
    thinking: "Boss thinking...",
    nextJoke: "Next Question Lah",
    generateJoke: "Ask Me Something",
    solved: "Te-ka te-ki Solved",
    footerCredit: "Powered by Gemini 3 Flash",
  },
  [Language.CHINESE]: {
    title: "大馬冷笑話",
    subtitle: "地道大馬猜謎遊戲",
    thinking: "Boss 思考中...",
    nextJoke: "下一題 Lah",
    generateJoke: "考考我吧",
    solved: "已解開謎題",
    footerCredit: "由 Gemini 3 Flash 強力驅動",
  }
};

const App: React.FC = () => {
  const [joke, setJoke] = useState<Joke | null>(null);
  const [lastCategory, setLastCategory] = useState<string | undefined>(undefined);
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [showPunchline, setShowPunchline] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [solvedCount, setSolvedCount] = useState<number>(0);

  const t = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t.title;
  }, [language, t.title]);

  const handleGenerateJoke = useCallback(async () => {
    setState(AppState.LOADING);
    setShowPunchline(false);
    try {
      const newJoke = await fetchRandomJoke(language, lastCategory);
      setJoke(newJoke);
      setLastCategory(newJoke.category);
      setState(AppState.SUCCESS);
    } catch (error) {
      setState(AppState.ERROR);
    }
  }, [language, lastCategory]);

  const handleReveal = () => {
    setShowPunchline(true);
    setSolvedCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-12 overflow-x-hidden transition-all duration-1000 text-white selection:bg-pink-500/30">
      {/* Background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse [animation-delay:2s]"></div>

      <header className="mb-10 text-center relative z-10 w-full max-w-xl">
        <div className="inline-flex flex-col items-center mb-6">
          <div className="p-5 rounded-[2rem] bg-white/5 glass shadow-2xl mb-4 group hover:scale-110 transition-transform duration-500">
            <span className="text-5xl group-hover:rotate-12 inline-block transition-transform">😂</span>
          </div>
          {solvedCount > 0 && (
            <div className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-widest uppercase text-white/40 animate-in fade-in slide-in-from-top-2">
              {solvedCount} {t.solved}
            </div>
          )}
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter mb-4">
          {t.title}
        </h1>
        <p className="text-indigo-200/40 text-sm md:text-base font-medium tracking-[0.2em] uppercase">
          {t.subtitle}
        </p>

        <div className="mt-10 flex justify-center">
          <div className="relative p-1.5 bg-white/5 glass rounded-2xl flex items-center shadow-2xl border border-white/5">
            <div 
              className={`absolute h-[calc(100%-12px)] bg-white/10 rounded-xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)`}
              style={{
                width: '120px',
                left: language === Language.ENGLISH ? '6px' : '130px'
              }}
            ></div>
            <button 
              onClick={() => setLanguage(Language.ENGLISH)}
              className={`relative z-10 w-[120px] py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${language === Language.ENGLISH ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLanguage(Language.CHINESE)}
              className={`relative z-10 w-[120px] py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${language === Language.CHINESE ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              中文
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-3xl relative z-10">
        <div className="glass rounded-[3rem] p-8 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all duration-700">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/10 transition-colors"></div>
          
          <JokeDisplay 
            joke={joke} 
            state={state} 
            showPunchline={showPunchline} 
            onReveal={handleReveal} 
            language={language}
          />

          <div className="mt-16 flex flex-col items-center">
            <button
              onClick={handleGenerateJoke}
              disabled={state === AppState.LOADING}
              className={`
                relative px-12 py-6 bg-gradient-to-br from-indigo-500 via-indigo-600 to-pink-600 rounded-[2rem] 
                text-white font-black text-lg tracking-widest uppercase shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)]
                hover:shadow-[0_25px_50px_-12px_rgba(236,72,153,0.6)] hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed
                group overflow-hidden
              `}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <span className="relative z-10 flex items-center gap-4">
                {state === AppState.LOADING ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {t.thinking}
                  </>
                ) : (
                  <>
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-500">🚀</span>
                    {joke ? t.nextJoke : t.generateJoke}
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-auto pt-16 pb-8 text-white/20 text-[10px] font-black uppercase tracking-[0.4em] relative z-10 flex flex-col items-center gap-2">
        <div className="w-8 h-[2px] bg-white/10 mb-2"></div>
        {t.footerCredit}
      </footer>
    </div>
  );
};

export default App;
