import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform">
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
              {['Home', "Result", "Admit Card", "Latest Jobs"].map((nav) => (
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
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-yellow-400 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-yellow-400">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
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
  );
}
