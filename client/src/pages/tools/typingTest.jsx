import React, { useState, useEffect, useRef } from 'react';
import { RefreshCcw, Trophy, Zap, Settings, Type, AlignLeft, BookOpen, CheckCircle } from 'lucide-react';
import { dataStore, funnyJokes, getFeedback } from '../../utils/typingAssest';
import SEO from '../../util/SEO';
import useIsMobile from '../../hooks/useIsMobile';
import { MobileLayout } from '../../components/MobileLayout';



export default function TypingTest() {
  const isMobile = useIsMobile(640);
  const [config, setConfig] = useState({ type: 'sentences', difficulty: 'medium' });
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [currentJoke, setCurrentJoke] = useState('');
  const inputRef = useRef(null);

  const generateContent = () => {
    const source = dataStore[config.type][config.difficulty];
    
    if (config.type === 'words' || config.type === 'meanings') {
      const shuffled = [...source].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 10).join(' ');
    } else {
      return source[Math.floor(Math.random() * source.length)];
    }
  };

  const resetGame = () => {
    setText(generateContent());
    setInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    setCurrentJoke('');
    if (inputRef.current) inputRef.current.focus();
  };

  useEffect(() => {
    resetGame();
  }, [config]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (isFinished) return;

    if (!startTime) setStartTime(Date.now());

    setInput(val);

    const correctChars = val.split('').filter((char, index) => char === text[index]).length;
    const accuracyVal = val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100;
    setAccuracy(accuracyVal);

    if (startTime) {
      const timeElapsed = (Date.now() - startTime) / 60000;
      const wordsTyped = val.trim().split(/\s+/).length;
      if (timeElapsed > 0) setWpm(Math.round(wordsTyped / timeElapsed));
    }

    if (val.length === text.length) {
      setIsFinished(true);
      setCurrentJoke(funnyJokes[Math.floor(Math.random() * funnyJokes.length)]);
    }
  };

  const TypingTestContent = () => (
    <div className={`min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col items-center p-6 selection:bg-indigo-100 selection:text-indigo-900 ${isMobile ? 'pb-24' : ''}`}>
      <SEO
        title="Free Typing Test Online | Check Typing Speed WPM - JobsAddah"
        description="Free online typing test to check your typing speed in WPM. Practice typing for SSC, Railway, Bank exams. Improve accuracy with easy, medium, and hard levels."
        keywords="typing test, typing speed test, wpm test, online typing test, free typing test, ssc typing test, bank typing test, typing practice"
        canonical="/tools/typing-test"
        section="Tools"
      />
      
      <header className="w-full max-w-5xl flex justify-between items-center mb-12 mt-4">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Type className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">JobsAddah Typing  <span className="text-indigo-600">Pro</span></h1>
        </div>
        
        <div className="flex gap-4">
          <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 p-1">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => setConfig({ ...config, difficulty: level })}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  config.difficulty === level 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl relative">
        <div className="mb-8 flex justify-center gap-4 flex-wrap">
           {[
             { id: 'words', icon: Type, label: 'Small Words' },
             { id: 'meanings', icon: BookOpen, label: 'Deep Meanings' },
             { id: 'phrases', icon: AlignLeft, label: 'Phrases' },
             { id: 'sentences', icon: Settings, label: 'Sentences' }
           ].map((mode) => (
             <button
              key={mode.id}
              onClick={() => setConfig({ ...config, type: mode.id })}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all duration-200 ${
                config.type === mode.id
                  ? 'bg-white border-indigo-500 shadow-md text-indigo-700 translate-y-[-2px]'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
              }`}
             >
               <mode.icon size={18} />
               <span className="font-semibold">{mode.label}</span>
             </button>
           ))}
        </div>

        <div 
          className="relative bg-white rounded-2xl shadow-xl border border-slate-100 p-12 min-h-[200px] flex items-center flex-wrap cursor-text group"
          onClick={() => inputRef.current.focus()}
        >
          <div className="absolute top-4 right-4 flex gap-4 text-slate-400 font-mono text-sm">
             <span className="flex items-center gap-1"><Zap size={14}/> {wpm} WPM</span>
             <span className="flex items-center gap-1"><CheckCircle size={14}/> {accuracy}% ACC</span>
          </div>

          <p className="text-3xl leading-relaxed font-medium tracking-wide text-slate-300 w-full break-words">
            {text.split('').map((char, index) => {
              let color = 'text-slate-300';
              let bg = 'bg-transparent';
              let decoration = '';
              
              if (index < input.length) {
                if (input[index] === char) {
                  color = 'text-slate-800'; 
                } else {
                  color = 'text-red-500';
                  bg = 'bg-red-50';
                  decoration = 'line-through decoration-red-300';
                }
              } else if (index === input.length) {
                bg = 'bg-indigo-500 w-0.5 h-8 inline-block animate-pulse align-middle'; 
                color = 'text-indigo-600'; 
                return <span key={index} className="relative text-indigo-600 border-l-2 border-indigo-500 animate-pulse">{char}</span>
              }

              return (
                <span key={index} className={`${color} ${bg} ${decoration} rounded-sm transition-colors duration-100`}>
                  {char}
                </span>
              );
            })}
          </p>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleChange}
            className="opacity-0 absolute inset-0 cursor-default"
            autoFocus
          />
        </div>

        <div className="mt-8 flex justify-center">
          <button 
            onClick={resetGame}
            className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-full hover:border-indigo-500 hover:text-indigo-600 hover:shadow-lg transition-all"
          >
            <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-semibold">Reset Test</span>
          </button>
        </div>
      </main>

      {isFinished && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-white animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center -mt-16 mb-4">
               <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-4 rounded-full shadow-lg text-white">
                 <Trophy size={48} />
               </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Test Complete!</h2>
            <p className="text-indigo-600 font-medium text-lg mb-6">"{getFeedback(wpm, accuracy)}"</p>
            
            <div className="flex justify-center gap-6 mb-6">
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl min-w-[100px] border border-slate-100">
                <span className="text-3xl font-black text-indigo-600">{wpm}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">WPM</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl min-w-[100px] border border-slate-100">
                <span className={`text-3xl font-black ${accuracy === 100 ? 'text-green-500' : 'text-slate-700'}`}>{accuracy}%</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accuracy</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-8">
              <p className="text-xs font-bold text-yellow-600 uppercase mb-1">😂 Bonus Joke for You</p>
              <p className="text-slate-700 italic whitespace-pre-line">{currentJoke}</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsFinished(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={resetGame}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="fixed bottom-4 right-4 text-xs text-slate-300 select-none">
        Made with ❤️ for faster fingers
      </div>

    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout title="Typing Test" showBack={true}>
        <TypingTestContent />
      </MobileLayout>
    );
  }

  return <TypingTestContent />;
}