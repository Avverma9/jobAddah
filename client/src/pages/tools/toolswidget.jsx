import React from 'react';
import { 
  ImageIcon, 
  FileText, 
  Keyboard, 
  Calculator, 
  BrainCircuit, 
  ArrowRight, 
  Lock,
  Sparkles
} from 'lucide-react';

const tools = [
  {
    id: 1,
    title: "Image",
    fullTitle: "Image Master",
    description: "Edit & compress.",
    icon: <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
    status: "active",
    href: "/jobsaddah-image-tools",
    badge: "Hot",
    color: "blue"
  },
  {
    id: 2,
    title: "PDF",
    fullTitle: "PDF Reducer",
    description: "Shrink PDF size.",
    icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />,
    status: "coming_soon",
    color: "red"
  },
  {
    id: 3,
    title: "Typing",
    fullTitle: "Typing Test",
    description: "Check speed.",
    icon: <Keyboard className="w-5 h-5 sm:w-6 sm:h-6" />,
    status: "coming_soon",
    color: "orange"
  },
  {
    id: 4,
    title: "Salary",
    fullTitle: "Salary Est.",
    description: "Check pay scale.",
    icon: <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />,
    status: "coming_soon",
    color: "green"
  },
  {
    id: 5,
    title: "Quiz",
    fullTitle: "Skill Quiz",
    description: "Practice MCQs.",
    icon: <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6" />,
    status: "coming_soon",
    color: "purple"
  }
];

const ToolCard = ({ tool }) => {
  const isActive = tool.status === "active";
  
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    red: "bg-red-100 text-red-500",
    orange: "bg-orange-100 text-orange-500",
    green: "bg-green-100 text-green-500",
    purple: "bg-purple-100 text-purple-500",
    gray: "bg-gray-100 text-gray-500"
  };

  const containerClasses = "aspect-square w-full rounded-full flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden p-1 sm:p-3";

  if (isActive) {
    return (
      <a 
        href={tool.href}
        className={`group ${containerClasses} bg-white border border-blue-100 sm:border-4 sm:border-blue-50 hover:border-blue-200 shadow-sm hover:shadow-lg hover:scale-105`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {tool.badge && (
          <span className="hidden sm:block absolute top-4 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold bg-amber-400 text-amber-900 shadow-sm transform -rotate-6">
            {tool.badge}
          </span>
        )}

        <div className={`p-1.5 sm:p-2.5 rounded-full mb-1 sm:mb-1.5 transition-colors duration-300 ${colorClasses[tool.color]} ring-0 sm:ring-4 ring-white`}>
          {tool.icon}
        </div>
        
        <h3 className="text-[10px] sm:text-sm font-bold text-gray-900 leading-none sm:leading-tight group-hover:text-blue-600 mt-0.5">
          <span className="sm:hidden">{tool.title}</span>
          <span className="hidden sm:block">{tool.fullTitle}</span>
        </h3>
        
        <p className="hidden sm:block text-gray-500 text-[10px] leading-snug px-1 mt-1">
          {tool.description}
        </p>

        <div className="hidden sm:inline-flex mt-1 items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <ArrowRight className="w-2.5 h-2.5" />
        </div>
      </a>
    );
  }

  return (
    <div className={`group ${containerClasses} bg-gray-50 border border-gray-100 sm:border-4 sm:border-gray-100 opacity-90 cursor-not-allowed`}>
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
        <span className="flex items-center gap-0.5 sm:gap-1 bg-gray-900 text-white px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-medium shadow-xl transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform whitespace-nowrap">
          <Lock className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5" /> 
          <span className="hidden sm:inline">Coming Soon</span>
          <span className="sm:hidden">Soon</span>
        </span>
      </div>

      <div className={`p-1.5 sm:p-2.5 rounded-full mb-1 sm:mb-1.5 bg-gray-200 text-gray-400 grayscale`}>
        {tool.icon}
      </div>
      
      <h3 className="text-[10px] sm:text-sm font-bold text-gray-700 leading-none sm:leading-tight mt-0.5">
        <span className="sm:hidden">{tool.title}</span>
        <span className="hidden sm:block">{tool.fullTitle}</span>
      </h3>
      
      <p className="hidden sm:block text-gray-400 text-[10px] leading-snug px-1 mt-1">
        {tool.description}
      </p>

      <div className="sm:hidden absolute top-1 right-1 bg-gray-200 rounded-full p-0.5">
          <Lock className="w-2.5 h-2.5 text-gray-500" />
      </div>
    </div>
  );
};

export default function Tools() {
  return (
    <div className="w-full bg-slate-50 py-6 sm:py-8 px-2 font-sans overflow-hidden">
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient-x 3s linear infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-10 relative z-10">
          <div className="relative inline-block">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
            
            <h2 className="relative text-2xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient pb-1 drop-shadow-sm">
              Popular Tools
            </h2>

            <div className="absolute -top-3 -right-4 sm:-top-5 sm:-right-8 animate-float">
               <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-400 fill-yellow-100" />
            </div>
            <div className="absolute -bottom-1 -left-3 sm:-bottom-2 sm:-left-6 animate-float" style={{ animationDelay: '1.5s' }}>
               <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400 fill-blue-100" />
            </div>
          </div>
        </div>

        <div className="flex justify-center items-start gap-2 sm:gap-6 px-1">
          {tools.map((tool) => (
            <div key={tool.id} className="flex-1 max-w-[18vw] sm:max-w-[140px]">
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}