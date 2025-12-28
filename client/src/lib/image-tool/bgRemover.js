import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from './imageUploader'
import { Card } from '@/components/ui/Card'
import { Wand2, Eraser, Calendar, Undo2, Download, Save, MousePointer2 } from 'lucide-react'
import { Slider } from './slider'

export const BgRemover = ({ sharedImage, setSharedImage }) => {
    const canvasRef = useRef(null);
    const workCanvasRef = useRef(null);

    const [image, setImage] = useState(null);
    const [history, setHistory] = useState([]);

    const [tool, setTool] = useState('magic');
    const [tolerance, setTolerance] = useState(30);
    const [brushSize, setBrushSize] = useState(20);
    const [isDrawing, setIsDrawing] = useState(false);
    const [bgColor, setBgColor] = useState('#ffffff');
    const [isTransparent, setIsTransparent] = useState(true);
    const [lastMagicClick, setLastMagicClick] = useState(null);

    const [dateSettings, setDateSettings] = useState({
        show: false,
        text: '',
        style: 'slate',
        bgSlate: '#222222'
    });

    useEffect(() => {
        if (sharedImage && !image) processLoadedImage(sharedImage);
    }, [sharedImage]);

    const processLoadedImage = (img) => {
        setImage(img);
        setHistory([]);
        setLastMagicClick(null);
        setTimeout(() => {
            const w = img.width;
            const h = img.height;

            const wk = document.createElement('canvas');
            wk.width = w; wk.height = h;
            const wCtx = wk.getContext('2d');
            wCtx.drawImage(img, 0, 0);
            workCanvasRef.current = wk;

            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = w;
                canvas.height = h;
                updateDisplay();
                saveState();
            }
        }, 100);
    };

    const updateDisplay = () => {
        const wk = workCanvasRef.current;
        const canvas = canvasRef.current;
        if (!wk || !canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!isTransparent) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(wk, 0, 0);

        if (dateSettings.show && dateSettings.text) {
            drawDateOverlay(
                ctx,
                canvas.width,
                canvas.height,
                dateSettings.text,
                dateSettings.style,
                dateSettings.bgSlate
            );
        }
    };

    useEffect(() => {
        if (lastMagicClick && tool === 'magic') {
            const wk = workCanvasRef.current;
            const ctx = wk.getContext('2d');

            ctx.putImageData(lastMagicClick.data, 0, 0);

            applyMagicWand(ctx, lastMagicClick.data, lastMagicClick.x, lastMagicClick.y, tolerance);

            updateDisplay();

            setHistory(prev => {
                const newHist = [...prev];
                if (newHist.length > 0) {
                    newHist[newHist.length - 1] = ctx.getImageData(0, 0, wk.width, wk.height);
                }
                return newHist;
            });
        }
    }, [tolerance]);

    useEffect(() => {
        if (image) updateDisplay();
    }, [dateSettings, bgColor, isTransparent]);

    const saveState = () => {
        const wk = workCanvasRef.current;
        if (!wk) return;
        const ctx = wk.getContext('2d');
        const data = ctx.getImageData(0, 0, wk.width, wk.height);
        setHistory(prev => [...prev.slice(-4), data]);
    };

    const undo = () => {
        setLastMagicClick(null);
        if (history.length <= 1) return;
        const newHistory = [...history];
        newHistory.pop();
        const prevState = newHistory[newHistory.length - 1];
        setHistory(newHistory);

        const wk = workCanvasRef.current;
        const ctx = wk.getContext('2d');
        ctx.putImageData(prevState, 0, 0);
        updateDisplay();
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    processLoadedImage(img);
                    setSharedImage(img);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const applyMagicWand = (ctx, baseImageData, x, y, t) => {
        const w = baseImageData.width;
        const h = baseImageData.height;
        const currentData = new ImageData(
            new Uint8ClampedArray(baseImageData.data),
            w, h
        );

        const pixelIndex = (y * w + x) * 4;
        const targetR = currentData.data[pixelIndex];
        const targetG = currentData.data[pixelIndex + 1];
        const targetB = currentData.data[pixelIndex + 2];
        const targetA = currentData.data[pixelIndex + 3];

        if (targetA === 0) return;

        const data = currentData.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
            if (data[i + 3] === 0) continue;

            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (
                Math.abs(r - targetR) < t &&
                Math.abs(g - targetG) < t &&
                Math.abs(b - targetB) < t
            ) {
                data[i + 3] = 0;
            }
        }
        ctx.putImageData(currentData, 0, 0);
    };

    const handleCanvasClick = (e) => {
        if (tool !== 'magic' || !image || !workCanvasRef.current) return;

        const wk = workCanvasRef.current;
        const ctx = wk.getContext('2d');
        const rect = canvasRef.current.getBoundingClientRect();

        const scaleX = wk.width / rect.width;
        const scaleY = wk.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);

        const cleanData = ctx.getImageData(0, 0, wk.width, wk.height);
        setLastMagicClick({ x, y, data: cleanData });

        applyMagicWand(ctx, cleanData, x, y, tolerance);

        saveState();
        updateDisplay();
    };

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    const handleMouseDown = (e) => {
        if (tool !== 'eraser') return;
        setLastMagicClick(null);
        setIsDrawing(true);
        erase(e);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || tool !== 'eraser') return;
        erase(e);
    };

    const handleMouseUp = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveState();
        }
    };

    const erase = (e) => {
        const wk = workCanvasRef.current;
        const ctx = wk.getContext('2d');
        const { x, y } = getPos(e);

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        updateDisplay();
    };

    const downloadImage = () => {
        const link = document.createElement('a');
        link.download = 'removed-bg-edited.png';
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    const saveToWorkspace = () => {
        if (canvasRef.current) {
            setSharedImage(canvasRef.current.toDataURL());
        }
    };

    return (
        <Card>
            <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <ImageUploader label="Upload Image" image={image} onUpload={handleImageUpload} onRemove={() => setImage(null)} />

                    {image && (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex gap-2">
                                <Button
                                    variant={tool === 'magic' ? 'active' : 'secondary'}
                                    onClick={() => { setTool('magic'); setLastMagicClick(null); }}
                                    className="flex-1 text-xs"
                                >
                                    <Wand2 size={16} /> Auto
                                </Button>
                                <Button
                                    variant={tool === 'eraser' ? 'active' : 'secondary'}
                                    onClick={() => { setTool('eraser'); setLastMagicClick(null); }}
                                    className="flex-1 text-xs"
                                >
                                    <Eraser size={16} /> Manual
                                </Button>
                            </div>

                            {tool === 'magic' ? (
                                <div className="bg-slate-50 p-3 rounded border">
                                    <Slider label="Color Tolerance" value={tolerance} min={1} max={100} onChange={setTolerance} />
                                </div>
                            ) : (
                                <div className="bg-slate-50 p-3 rounded border">
                                    <Slider label="Eraser Size" value={brushSize} min={5} max={100} onChange={setBrushSize} unit="px" />
                                </div>
                            )}

                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded border">
                                <span className="text-xs font-bold text-gray-600">Background</span>
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input type="radio" checked={isTransparent} onChange={() => setIsTransparent(true)} />
                                        <span className="text-xs">None</span>
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input type="radio" checked={!isTransparent} onChange={() => setIsTransparent(false)} />
                                        <input type="color" value={bgColor} onChange={(e) => { setBgColor(e.target.value); setIsTransparent(false); }} className="w-6 h-6 rounded border-0" />
                                    </label>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-slate-600 pt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><Calendar size={12} /> NAME / DOB</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={dateSettings.show} onChange={(e) => setDateSettings({ ...dateSettings, show: e.target.checked })} />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {dateSettings.show && (
                                    <div className="space-y-2 bg-white dark:bg-slate-800 p-2 rounded border border-gray-100 dark:border-slate-700">
                                        <input
                                            type="text"
                                            placeholder="e.g. Rahul 20/05/1998"
                                            className="w-full text-sm border p-1.5 rounded"
                                            value={dateSettings.text}
                                            onChange={(e) => setDateSettings({ ...dateSettings, text: e.target.value })}
                                        />
                                        <div className="flex gap-2 text-xs">
                                            <button
                                                onClick={() => setDateSettings({ ...dateSettings, style: 'slate' })}
                                                className={`flex-1 py-1 px-2 rounded border flex items-center justify-center gap-1 ${dateSettings.style === 'slate' ? 'ring-2 ring-blue-500 border-transparent bg-blue-50' : 'border-gray-300'}`}
                                            >
                                                <div className="w-3 h-3 bg-black border border-gray-500 rounded-sm"></div> Slate
                                            </button>
                                            <button
                                                onClick={() => setDateSettings({ ...dateSettings, style: 'white' })}
                                                className={`flex-1 py-1 px-2 rounded border flex items-center justify-center gap-1 ${dateSettings.style === 'white' ? 'ring-2 ring-blue-500 border-transparent bg-blue-50' : 'border-gray-300'}`}
                                            >
                                                <div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div> White
                                            </button>
                                        </div>
                                        {dateSettings.style === 'slate' && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-gray-500">Slate Color:</span>
                                                <input type="color" value={dateSettings.bgSlate} onChange={(e) => setDateSettings({ ...dateSettings, bgSlate: e.target.value })} className="h-4 w-8 border-0 p-0" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={undo} disabled={history.length <= 1} variant="secondary" className="flex-1">
                                    <Undo2 size={14} /> Undo
                                </Button>
                                <Button onClick={downloadImage} className="flex-1">
                                    <Download size={14} /> Save
                                </Button>
                            </div>
                            <Button onClick={saveToWorkspace} className="w-full bg-blue-700 hover:bg-blue-800">
                                <Save size={14} /> Save Changes to App
                            </Button>
                        </div>
                    )}
                </div>

                <div
                    className={`md:col-span-3 rounded-lg flex items-center justify-center p-4 min-h-125 relative overflow-hidden ${isTransparent ? 'bg-checkered' : ''}`}
                    style={{ backgroundColor: isTransparent ? undefined : bgColor }}
                >
                    <style jsx>{`
            .bg-checkered {
              background-image: linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
              background-size: 20px 20px;
              background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
            }
          `}</style>
                    <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className={`max-w-full max-h-125 shadow-xl object-contain ${!image ? 'hidden' : ''} ${tool === 'eraser' ? 'cursor-crosshair' : 'cursor-pointer'}`}
                    />
                    {!image && <div className="text-center text-gray-400">
                        <MousePointer2 className="mx-auto mb-2 opacity-50" size={48} />
                        <p>Upload image to start editing</p>
                    </div>}
                </div>
            </div>
        </Card>
    );
};