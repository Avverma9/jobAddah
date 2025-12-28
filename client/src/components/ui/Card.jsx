import React from 'react'

export const Card = ({ children, className = "" }) => (
    <div className={`bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl shadow-lg p-3 md:p-6 ${className}`}>
        {children}
    </div>
);
