import React from "react";

export const Button = ({ 
  children, 
  onClick, 
  disabled, 
  className = "", 
  variant = "primary", 
  type = "button" 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
    secondary: "bg-gray-200 text-slate-700 hover:bg-gray-300",
    outline: "border border-gray-300 text-slate-600 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
};
