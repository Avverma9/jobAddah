"use client"
import React from 'react'

export const Button = ({ onClick, children, variant = "primary", className = "", disabled = false, title = "" }) => {
    const baseStyle = "px-3 py-2 text-xs md:text-sm md:px-4 md:py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-2";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed",
        secondary: "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:bg-gray-50 disabled:text-gray-400",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400",
        active: "bg-blue-100 text-blue-700 border border-blue-200 ring-2 ring-blue-500 ring-offset-1"
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            disabled={disabled}
            title={title}
        >
            {children}
        </button>
    );
};
