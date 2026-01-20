export const Slider = ({ label, value, min, max, onChange, unit = "" }) => (
    <div className="mb-2 md:mb-3">
        <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
    </div>
);