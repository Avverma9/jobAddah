import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Clock, AlertCircle, IndianRupee, Wallet, Play, RotateCcw, CheckCircle } from 'lucide-react';
import { getShuffledQuestions } from '../../util/quiz';
import useIsMobile from '../../hooks/useIsMobile';
import { MobileLayout } from '../../components/MobileLayout';

// --- GAME CONFIGURATION ---
const WINNING_SCORE = 20;
const TIME_PER_QUESTION = 10;
const REWARD_AMOUNT = 10;

// --- QUESTION GENERATOR ---
// 500 Questions generate karne ke liye hum GK aur Math questions mix karenge
const generateQuestions = () => {
  // Get shuffled GK questions with randomized options
  const shuffledGkQuestions = getShuffledQuestions();

  // Generate math questions to fill the rest up to 500
  const remainingCount = 500 - shuffledGkQuestions.length;
  const mathQuestions = [];
  for (let i = 0; i < remainingCount; i++) {
    const a = Math.floor(Math.random() * 30) + 1; // Slightly harder numbers
    const b = Math.floor(Math.random() * 30) + 1;
    const isSum = Math.random() > 0.5;
    const questionText = isSum ? `${a} + ${b} = ?` : `${Math.max(a,b)} - ${Math.min(a,b)} = ?`;
    const correctAnswer = isSum ? a + b : Math.max(a,b) - Math.min(a,b);
    
    // Generate wrong options
    const wrong1 = correctAnswer + Math.floor(Math.random() * 3) + 1;
    const wrong2 = correctAnswer - Math.floor(Math.random() * 3) - 1;
    const wrong3 = correctAnswer + (Math.random() > 0.5 ? 5 : -5);
    
    const opts = [correctAnswer.toString(), wrong1.toString(), wrong2.toString(), wrong3.toString()].sort(() => Math.random() - 0.5);
    
    mathQuestions.push({
      q: questionText,
      options: opts,
      ans: correctAnswer.toString()
    });
  }

  return [...shuffledGkQuestions, ...mathQuestions];
};

export default function QuizApp() {
  const isMobile = useIsMobile(640);
  const [gameState, setGameState] = useState('start'); // start, playing, won, upi_input, success, gameover
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(TIME_PER_QUESTION);
  const [upiId, setUpiId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Initialize questions
  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (gameState === 'playing' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && gameState === 'playing') {
      handleGameOver();
    }
    return () => clearInterval(interval);
  }, [timer, gameState]);

  const startGame = () => {
    setQuestions(generateQuestions().sort(() => Math.random() - 0.5)); // Reshuffle for new game
    setCurrentQIndex(0);
    setScore(0);
    setTimer(TIME_PER_QUESTION);
    setGameState('playing');
  };

  const handleAnswer = (selectedOption) => {
    const currentQuestion = questions[currentQIndex];
    if (selectedOption === currentQuestion.ans) {
      const newScore = score + 1;
      setScore(newScore);
      
      if (newScore === WINNING_SCORE) {
        setGameState('won');
      } else {
        // Next Question
        setCurrentQIndex((prev) => prev + 1);
        setTimer(TIME_PER_QUESTION); // Reset timer
      }
    } else {
      handleGameOver();
    }
  };

  const handleGameOver = () => {
    setGameState('gameover');
  };

  const handleToUpi = () => {
    setGameState('upi_input');
  };

  const submitUpi = () => {
    if (!upiId.includes('@')) {
      setErrorMsg('Please enter a valid UPI ID (e.g., name@okicici)');
      return;
    }
    // Simulate API call/Saving
    setTimeout(() => {
      setGameState('success');
    }, 1000);
  };

  // --- RENDERING COMPONENTS ---

  const StartScreen = () => (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 text-center animate-fadeIn w-full">
      <div className="bg-yellow-100 p-4 rounded-full border-4 border-yellow-400 shadow-lg">
        <IndianRupee size={64} className="text-yellow-600" />
      </div>
      <h1 className="text-4xl font-extrabold text-blue-900">Quiz Khelo, Paise Jeeto!</h1>
      <p className="text-gray-600 text-lg max-w-md">
        100 Questions hain. Aapko sirf <b>20 Questions</b> ka sahi jawab dena hai.
        Har sawal ke liye <b>10 Second</b> milenge.
      </p>
      
      <div className="bg-green-50 p-4 rounded-lg border border-green-200 w-full max-w-sm">
        <h3 className="font-bold text-green-800 flex items-center justify-center gap-2">
          <Trophy size={20} /> Reward: ₹{REWARD_AMOUNT}
        </h3>
        <p className="text-sm text-green-700 mt-1">Winning ke baad seedha UPI mein transfer.</p>
      </div>

      <button 
        onClick={startGame}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transform transition active:scale-95 text-xl"
      >
        <Play size={24} /> Game Start Karo
      </button>
      <p className="text-xs text-gray-400 mt-4">Disclaimer: This is a demo app.</p>
    </div>
  );

  const GameScreen = () => {
    const currentQ = questions[currentQIndex];
    // Calculate progress percentage for timer bar
    const progress = (timer / TIME_PER_QUESTION) * 100;
    
    // Determine timer color
    let timerColor = 'bg-green-500';
    if (timer <= 3) timerColor = 'bg-yellow-500';
    if (timer <= 1) timerColor = 'bg-red-500';

    return (
      <div className="w-full max-w-lg p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-full text-blue-800 font-bold shadow-sm">
            Score: {score}/{WINNING_SCORE}
          </div>
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-4 py-2 rounded-full text-red-600 font-bold shadow-sm">
            <Clock size={20} /> {timer}s
          </div>
        </div>

        {/* Timer Bar */}
        <div className="w-full h-4 bg-gray-200 rounded-full mb-8 overflow-hidden shadow-inner border border-gray-300">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${timerColor}`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 mb-6 min-h-[160px] flex items-center justify-center text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {currentQIndex + 1}. {currentQ.q}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(opt)}
              className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-900 font-semibold py-4 px-2 rounded-xl text-lg transition shadow-sm active:bg-blue-200"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const GameOverScreen = () => (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 text-center animate-bounce-in w-full">
      <div className="bg-red-100 p-6 rounded-full border-4 border-red-500 mb-4">
        <AlertCircle size={64} className="text-red-600" />
      </div>
      <h2 className="text-3xl font-bold text-red-700">Game Over!</h2>
      <p className="text-xl text-gray-700">
        Aapka score: <span className="font-bold">{score}</span>
      </p>
      <p className="text-gray-500">
        Jeetne ke liye {WINNING_SCORE} sawal sahi hone chahiye.
      </p>
      <button 
        onClick={startGame}
        className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white font-bold py-3 px-8 rounded-full shadow-lg mt-6"
      >
        <RotateCcw size={20} /> Phir se koshish karein
      </button>
    </div>
  );

  const WinScreen = () => (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 text-center w-full">
      <div className="bg-yellow-100 p-6 rounded-full border-4 border-yellow-400 animate-pulse">
        <Trophy size={80} className="text-yellow-600" />
      </div>
      <h2 className="text-4xl font-extrabold text-green-700">Mubarak Ho!</h2>
      <p className="text-xl text-gray-800">
        Aapne {score} questions sahi kiye hain.
      </p>
      <div className="bg-green-50 p-4 rounded-xl border border-green-200 w-full max-w-xs mx-auto">
        <p className="font-bold text-green-800 text-lg">You Won ₹{REWARD_AMOUNT}</p>
      </div>
      
      <button 
        onClick={handleToUpi}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg animate-bounce"
      >
        <Wallet size={24} /> Paise Claim Karein
      </button>
    </div>
  );

  const UpiInputScreen = () => (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Details</h2>
      <p className="text-gray-600 mb-4 text-center">Apna UPI ID enter karein taaki hum paise bhej sakein.</p>
      
      <div className="w-full">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Enter UPI ID
        </label>
        <input 
          type="text" 
          placeholder="example@upi"
          value={upiId}
          onChange={(e) => {
            setUpiId(e.target.value);
            setErrorMsg('');
          }}
          className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        {errorMsg && <p className="text-red-500 text-xs italic mt-2">{errorMsg}</p>}
      </div>

      <button 
        onClick={submitUpi}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline mt-4 shadow-lg"
      >
        Submit Details
      </button>
    </div>
  );

  const SuccessScreen = () => (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center w-full">
      <div className="bg-green-100 p-4 rounded-full">
        <CheckCircle size={80} className="text-green-500" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800">Details Saved!</h2>
      <div className="space-y-2">
        <p className="text-lg text-gray-600">
          Aapka UPI ID: <span className="font-bold text-gray-800">{upiId}</span>
        </p>
        <p className="text-blue-600 font-semibold bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100">
          Next 3 hours me paise aapke account me credit ho jayenge.
        </p>
      </div>
      <button 
        onClick={() => {
            setGameState('start'); 
            setUpiId('');
        }}
        className="text-gray-500 hover:text-gray-800 underline mt-8"
      >
        Home Page
      </button>
    </div>
  );

  const QuizContent = () => (
    <div className={`min-h-screen bg-slate-200 flex items-center justify-center font-sans p-4 ${isMobile ? 'pb-24' : ''}`}>
      {/* Mobile Frame Container */}
      
      <div className="w-full max-w-md bg-slate-50 shadow-2xl rounded-3xl overflow-hidden min-h-[650px] flex flex-col items-center justify-center relative border border-white">
        {/* Decorative Status Bar Area */}
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        
        {gameState === 'start' && <StartScreen />}
        {gameState === 'playing' && <GameScreen />}
        {gameState === 'gameover' && <GameOverScreen />}
        {gameState === 'won' && <WinScreen />}
        {gameState === 'upi_input' && <UpiInputScreen />}
        {gameState === 'success' && <SuccessScreen />}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout title="Quiz App" showBack={true}>
        <QuizContent />
      </MobileLayout>
    );
  }

  return <QuizContent />;
}