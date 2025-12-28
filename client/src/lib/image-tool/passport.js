import { useRef, useState,useEffect } from "react";
import { ImageUploader } from "./imageUploader";
import {Card} from "@/components/ui/Card";
import { ArrowRightLeft, ArrowUpDown, Grid3X3, Printer, RotateCcw } from "lucide-react";
import { Slider } from "./slider";
import { Button } from "@/components/ui/Button";

export const PhotoMakerTool = ({ sharedImage, setSharedImage }) => {
    const canvasRef = useRef(null);
    const [image, setImage] = useState(null);
    const [settings, setSettings] = useState({
        paperSize: 'a4',
        photoSize: 'passport',
        rows: 6,
        cols: 5,
        gap: 10,
        margin: 20,
        rotation: 0,
        panX: 0,
        panY: 0,
        sheetX: 0,
        sheetY: 0,
        borderWidth: 0,
        borderColor: '#000000',
    });

    const PAPER_SIZES = {
        'a4': { w: 2480, h: 3508, label: 'A4' },
        '4x6': { w: 1200, h: 1800, label: '4x6"' },
        '5x7': { w: 1500, h: 2100, label: '5x7"' },
    };

    const PHOTO_SIZES = {
        'passport': { w: 413, h: 531, label: 'Passport (3.5x4.5cm)' },
        'stamp': { w: 236, h: 295, label: 'Stamp (2x2.5cm)' },
        'pan': { w: 295, h: 413, label: 'Pan Card (2.5x3.5cm)' },
    };

    useEffect(() => {
        if (sharedImage && !image) setImage(sharedImage);
    }, [sharedImage]);

    const processImage = (img) => {
        setImage(img);
        setSharedImage(img);
        setSettings(prev => ({ ...prev, panX: 0, panY: 0, rotation: 0 }));
    };

    useEffect(() => {
        const handlePaste = (e) => getClipboardImage(e, processImage);
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.onload = () => processImage(img);
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (!canvasRef.current || !image) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const paper = PAPER_SIZES[settings.paperSize];
        const photo = PHOTO_SIZES[settings.photoSize];

        // Calculate needed width/height based on grid
        const calculatedWidth = (settings.margin * 2) +
            (settings.sheetX || 0) +
            (settings.cols * photo.w) +
            (Math.max(0, settings.cols - 1) * settings.gap);

        const calculatedHeight = (settings.margin * 2) +
            (settings.sheetY || 0) +
            (settings.rows * photo.h) +
            (Math.max(0, settings.rows - 1) * settings.gap);

        // Adjust canvas size to fit content or paper minimum
        canvas.width = Math.max(paper.w, calculatedWidth);
        canvas.height = calculatedHeight > 0 ? calculatedHeight : paper.h;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = photo.w;
        tempCanvas.height = photo.h;
        const tCtx = tempCanvas.getContext('2d');

        tCtx.save();
        tCtx.translate(photo.w / 2, photo.h / 2);
        tCtx.rotate((settings.rotation * Math.PI) / 180);

        const scale = Math.max(photo.w / image.width, photo.h / image.height);
        const rotationZoom = 1 + (Math.abs(Math.sin((settings.rotation * Math.PI) / 180)) * 0.4);
        const finalScale = scale * rotationZoom;

        tCtx.drawImage(
            image,
            - (image.width * finalScale) / 2 + settings.panX,
            - (image.height * finalScale) / 2 + settings.panY,
            image.width * finalScale,
            image.height * finalScale
        );
        tCtx.restore();

        if (settings.borderWidth > 0) {
            tCtx.strokeStyle = settings.borderColor;
            tCtx.lineWidth = settings.borderWidth;
            tCtx.strokeRect(
                settings.borderWidth / 2,
                settings.borderWidth / 2,
                photo.w - settings.borderWidth,
                photo.h - settings.borderWidth
            );
        }

        const { rows, cols, gap, margin, sheetX, sheetY } = settings;

        const startX = margin + (sheetX || 0);
        const startY = margin + (sheetY || 0);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = startX + c * (photo.w + gap);
                const y = startY + r * (photo.h + gap);

                ctx.drawImage(tempCanvas, x, y);
                ctx.strokeStyle = '#eeeeee';
                ctx.lineWidth = 1;
                ctx.strokeRect(x - 1, y - 1, photo.w + 2, photo.h + 2);
            }
        }

    }, [image, settings]);

    const download = () => {
        const link = document.createElement('a');
        link.download = `passport-sheet.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    const autoFit = () => {
        const paper = PAPER_SIZES[settings.paperSize];
        const photo = PHOTO_SIZES[settings.photoSize];
        const availW = paper.w - (2 * settings.margin);
        const availH = paper.h - (2 * settings.margin);
        const c = Math.floor(availW / (photo.w + settings.gap));
        const r = Math.floor(availH / (photo.h + settings.gap));
        setSettings(prev => ({ ...prev, rows: r, cols: c }));
    };

    return (
        <Card>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-80 shrink-0 space-y-4">
                    <ImageUploader label="Upload Photo" image={image} onUpload={handleUpload} onRemove={() => setImage(null)} />

                    {image && (
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl space-y-4 animate-fade-in border border-gray-100 dark:border-slate-700">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">PAPER WIDTH</label>
                                    <select value={settings.paperSize} onChange={(e) => setSettings({ ...settings, paperSize: e.target.value })} className="w-full p-2 text-sm border rounded bg-white dark:bg-slate-700">
                                        {Object.entries(PAPER_SIZES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">SIZE</label>
                                    <select value={settings.photoSize} onChange={(e) => setSettings({ ...settings, photoSize: e.target.value })} className="w-full p-2 text-sm border rounded bg-white dark:bg-slate-700">
                                        {Object.entries(PHOTO_SIZES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-slate-600 pt-3 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><RotateCcw size={12} /> ADJUST PHOTO</span>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><RotateCcw size={10} /> Rotate</span>
                                        <span>{settings.rotation}°</span>
                                    </div>
                                    <input
                                        type="range" min="-45" max="45" value={settings.rotation}
                                        onChange={(e) => setSettings({ ...settings, rotation: Number(e.target.value) })}
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="flex justify-between mb-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><ArrowRightLeft size={10} /> Move X</span>
                                        </div>
                                        <input
                                            type="range" min="-150" max="150" value={settings.panX}
                                            onChange={(e) => setSettings({ ...settings, panX: Number(e.target.value) })}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><ArrowUpDown size={10} /> Move Y</span>
                                        </div>
                                        <input
                                            type="range" min="-150" max="150" value={settings.panY}
                                            onChange={(e) => setSettings({ ...settings, panY: Number(e.target.value) })}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-slate-600 pt-3">
                                <span className="text-xs font-bold text-gray-500 block mb-2">SHEET POSITION</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="flex justify-between mb-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Grid3X3 size={10} /> Grid X</span>
                                        </div>
                                        <input
                                            type="range" min="-100" max="300" value={settings.sheetX || 0}
                                            onChange={(e) => setSettings({ ...settings, sheetX: Number(e.target.value) })}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Grid3X3 size={10} /> Grid Y</span>
                                        </div>
                                        <input
                                            type="range" min="-100" max="300" value={settings.sheetY || 0}
                                            onChange={(e) => setSettings({ ...settings, sheetY: Number(e.target.value) })}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-slate-600 pt-3">
                                <span className="text-xs font-bold text-gray-500 block mb-2">BORDER STYLING</span>
                                <div className="flex gap-2 items-center">
                                    <div className="flex-1">
                                        <Slider label="Thickness" value={settings.borderWidth} min={0} max={20} onChange={(v) => setSettings({ ...settings, borderWidth: v })} unit="px" />
                                    </div>
                                    <div>
                                        <input type="color" value={settings.borderColor} onChange={(e) => setSettings({ ...settings, borderColor: e.target.value })} className="h-8 w-8 rounded cursor-pointer border-0" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">ROWS</label>
                                    <input type="number" value={settings.rows} onChange={(e) => setSettings({ ...settings, rows: Number(e.target.value) })} className="w-full p-1.5 text-sm border rounded" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500">COLS</label>
                                    <input type="number" value={settings.cols} onChange={(e) => setSettings({ ...settings, cols: Number(e.target.value) })} className="w-full p-1.5 text-sm border rounded" />
                                </div>
                            </div>
                            <Button onClick={autoFit} variant="secondary" className="w-full text-xs">Fill Sheet Max</Button>
                            <Slider label="Gap" value={settings.gap} min={0} max={50} onChange={(v) => setSettings({ ...settings, gap: v })} unit="px" />
                            <Button onClick={download} className="w-full"><Printer size={16} /> Download Sheet</Button>
                        </div>
                    )}
                </div>

                <div className="grow bg-slate-200 dark:bg-slate-900 rounded-xl overflow-auto flex items-center justify-center p-4 min-h-125 border border-slate-300 dark:border-slate-700">
                    <canvas ref={canvasRef} className={`shadow-2xl bg-white transition-all ${!image ? 'opacity-0' : 'opacity-100'}`} style={{ maxHeight: '600px', maxWidth: '100%', width: 'auto', height: 'auto' }} />
                    {!image && <p className="absolute text-slate-400 font-medium">Preview Area</p>}
                </div>
            </div>
        </Card>
    );
};