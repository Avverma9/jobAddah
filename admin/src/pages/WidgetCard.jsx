export const WidgetCard = ({ title, icon, color, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="mb-4 flex items-center justify-between">
      <h4 className={`flex items-center gap-2 font-semibold text-slate-800`}>
        <span className={color}>{icon}</span>
        {title}
      </h4>
    </div>
    {children}
  </div>
);

export const WidgetLink = ({ text, isNew }) => (
  <li className="flex cursor-pointer items-start justify-between group transition-all duration-200 hover:translate-x-1">
    <span className="text-sm text-slate-600 group-hover:text-blue-600 line-clamp-1 transition-colors">
      {text}
    </span>
    {isNew && (
      <span className="ml-2 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white animate-pulse">
        NEW
      </span>
    )}
  </li>
);
