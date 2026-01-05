import Image from "next/image";
import { Check, RefreshCcw, Trash2, Upload } from "lucide-react";

export const ImageUploader = ({ label, image, onUpload, onRemove }) => {
    if (image) {
        return (
            <div className="bg-white border border-blue-100 rounded-lg p-2 flex items-center justify-between shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                        <Image
                            src={image.src}
                            alt="thumbnail preview"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-700 truncate">{label}</p>
                        <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                            <Check size={10} /> Loaded
                        </p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <label className="cursor-pointer p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="Replace">
                        <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
                        <RefreshCcw size={14} />
                    </label>
                    <button onClick={onRemove} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Remove">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group h-24 bg-gray-50">
            <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-500 mb-1 transition-transform group-hover:-translate-y-1" />
            <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600 text-center">{label}</span>
            <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
        </label>
    );
};