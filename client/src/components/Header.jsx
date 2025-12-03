import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Moon, Sun, Sparkles, Send, Bot } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const finalTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', finalTheme === 'dark');
    setIsDarkMode(finalTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // --- INTERNAL STYLES FOR ANIMATION (No external plugins needed) ---
  const animationStyles = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .chat-animate-enter {
      animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `;

  // --- CHAT WIDGET COMPONENT ---
  const GeminiChatWidget = () => {
    const [messages, setMessages] = useState([
      { text: "Hello! Main JobAddah AI Assistant hu. Jobs, Results ya Admit card se juda kuch bhi puchiye!", isUser: false }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages, isLoading]);

    const sendMessage = async () => {
      if (!input.trim()) return;

      const userMessage = { text: input, isUser: true };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch('http://localhost:5000/api/v1/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage.text }),
        });

        const data = await response.json();

        if (data.success) {
          setMessages((prev) => [...prev, { text: data.reply, isUser: false }]);
        } else {
          throw new Error(data.message || "Failed to get response");
        }
      } catch (error) {
        console.error("Chat Error:", error);
        setMessages((prev) => [...prev, { text: "Network error. Please check backend connection.", isUser: false, isError: true }]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <>
        <style>{animationStyles}</style>
        {/* Fixed Position Container */}
        <div className="fixed bottom-6 right-4 md:right-6 z-[100] flex flex-col items-end gap-4 chat-animate-enter">
          
          {/* Chat Box */}
          <div className="w-[90vw] md:w-96 h-[500px] max-h-[75vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-600 to-orange-500 p-4 flex justify-between items-center text-white shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">JobAddah AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                    <p className="text-[10px] text-white/90 font-medium">Online</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)} 
                className="hover:bg-white/20 p-2 rounded-full transition-colors active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-950/50 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  
                  {!msg.isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/30 flex items-center justify-center flex-shrink-0 border border-rose-200 dark:border-rose-800 shadow-sm mt-1">
                      <Sparkles size={14} className="text-rose-600 dark:text-rose-400" />
                    </div>
                  )}

                  <div className={`max-w-[80%] p-3.5 text-sm rounded-2xl shadow-sm ${
                    msg.isUser 
                      ? 'bg-gradient-to-r from-rose-600 to-orange-600 text-white rounded-tr-sm' 
                      : msg.isError
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-tl-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Sparkles size={14} className="text-gray-400" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-700 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-transparent focus-within:border-rose-500/50 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all shadow-inner">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask a question..." 
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none min-w-0"
                />
                <button 
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className={`p-2 rounded-full transition-all flex-shrink-0 ${
                    input.trim() 
                      ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-md transform hover:scale-105 active:scale-95' 
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                JA
              </div>
              <div className="leading-tight">
                <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600 dark:from-rose-400 dark:to-orange-400">
                  JobAddah
                </h1>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 tracking-widest uppercase">
                  The No.1 Job Portal
                </p>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-1">
                {['Home', "Result", "Admit Card", "Govt Jobs", "Private Jobs"].map((nav) => (
                  <a
                    key={nav}
                    href={`/${nav.toLowerCase().replace(' ', '-')}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                  >
                    {nav}
                  </a>
                ))}
              </nav>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-yellow-400 transition-colors"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                {/* AI Toggle Button (Desktop) */}
                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all shadow-sm ${
                    isChatOpen 
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 ring-2 ring-rose-500/20' 
                      : 'bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:shadow-md hover:scale-105'
                  }`}
                >
                  {isChatOpen ? <X size={18} /> : <Sparkles size={18} />}
                  <span>Addah AI</span>
                </button>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-3 md:hidden">
              <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-yellow-400">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`p-2 rounded-full ${
                  isChatOpen 
                    ? 'bg-rose-100 text-rose-600' 
                    : 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg'
                }`}
              >
                {isChatOpen ? <X size={20} /> : <Sparkles size={20} />}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-white"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 animate-in slide-in-from-top-5">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {['Home', "Result", "Admit Card", "Latest Jobs"].map((nav) => (
                <a
                  key={nav}
                  href={`/${nav.toLowerCase().replace(' ', '-')}`}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400"
                >
                  {nav}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* RENDER CHAT WIDGET */}
      {isChatOpen && <GeminiChatWidget />}
    </>
  );
}