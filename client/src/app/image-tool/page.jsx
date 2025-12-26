'use client';
import useIsMobile from '@/hooks/useIsMobile';
import {
    ArrowRightLeft, ArrowUpDown,
    Calendar,
    Check,
    Columns,
    Download,
    Eraser,
    Grid3X3,
    Layers,
    Layout,
    Maximize2,
    MousePointer2,
    Printer,
    RefreshCw,
    RotateCcw,
    Save,
    Trash2,
    Undo2,
    Upload,
    Wand2
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SidebarAd, MobileBannerAd, LeaderboardAd } from '@/components/ads/AdUnits';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl shadow-lg p-3 md:p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = "primary", className = "", disabled = false, title = "" }) => {
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

const Slider = ({ label, value, min, max, onChange, unit = "" }) => (
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

const ImageUploader = ({ label, image, onUpload, onRemove }) => {
  if (image) {
    return (
      <div className="bg-white border border-blue-100 rounded-lg p-2 flex items-center justify-between shadow-sm animate-fade-in">
        <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center shrink-0 border border-gray-200">
                <img src={image.src} alt="thumbnail" className="w-full h-full object-cover rounded-md" />
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
                <RefreshCw size={14} />
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

const drawDateOverlay = (ctx, w, h, text, style, bgColor = '#000000') => {
    const stripHeight = h * 0.20; 
    const yPos = h - stripHeight;
    
    if (style === 'slate') {
        ctx.fillStyle = bgColor; 
        ctx.fillRect(0, yPos, w, stripHeight);
        ctx.strokeStyle = '#e5e5e5';
        ctx.lineWidth = 2;
        ctx.strokeRect(4, yPos + 4, w - 8, stripHeight - 8);
        ctx.fillStyle = '#ffffff';
    } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, yPos, w, stripHeight);
        ctx.fillStyle = '#000000';
    }

    ctx.font = `bold ${stripHeight * 0.45}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, yPos + (stripHeight / 2));
};

const getClipboardImage = (e, callback) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile();
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => callback(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(blob);
      e.preventDefault(); 
      break;
    }
  }
};

export default function ImageEditor() {
  const isMobile = useIsMobile(640);
  const [hydrated, setHydrated] = useState(false);

  // Mark hydrated to avoid SSR/client hydration mismatches when using viewport checks
  useEffect(() => {
    setHydrated(true);
  }, []);
  const [activeTab, setActiveTab] = useState('photo-maker');
  const [sharedImage, setSharedImage] = useState(null); 

  const updateSharedImage = (imgOrUrl) => {
      if(typeof imgOrUrl === 'string') {
          const img = new Image();
          img.onload = () => setSharedImage(img);
          img.src = imgOrUrl;
      } else {
          setSharedImage(imgOrUrl);
      }
  };
  
  const renderContent = () => {
    const props = { sharedImage, setSharedImage: updateSharedImage };
    switch(activeTab) {
      case 'photo-maker': return <PhotoMakerTool {...props} />;
      case 'bg-remover': return <BgRemover {...props} />;
      case 'overlay': return <OverlayTool {...props} />;
      case 'resizer': return <ResizerTool {...props} />;
      case 'joiner': return <JoinerTool {...props} />;
      default: return <PhotoMakerTool {...props} />;
    }
  };

  const ImageEditorContent = () => {
    if (!hydrated) {
      return (
        <div className="min-h-screen bg-gray-50 p-2 md:p-6 font-sans text-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-6"></div>
              <div className="h-10 bg-gray-200 rounded w-96 mx-auto mb-6"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
    <div className="force-light">
      <style jsx global>{`
        /* Force light theme inside the image tool */
        .force-light .dark\\:bg-slate-900,
        .force-light .dark\\:bg-slate-800,
        .force-light .dark\\:bg-slate-700,
        .force-light .dark\\:bg-slate-700\\/50,
        .force-light .dark\\:bg-slate-600 { background-color: transparent !important; background-image: none !important; }

        .force-light .dark\\:text-slate-100,
        .force-light .dark\\:text-slate-400,
        .force-light .dark\\:text-gray-300,
        .force-light .dark\\:text-slate-200 { color: inherit !important; }

        .force-light .dark\\:border-slate-700,
        .force-light .dark\\:border-slate-600 { border-color: rgba(0,0,0,0.08) !important; }

        .force-light .dark\\:hover\\:bg-slate-700 { background-color: #f1f5f9 !important; }
      `}</style>

  <div className={`min-h-screen bg-gray-50 p-2 md:p-6 font-sans text-slate-900 ${hydrated && isMobile ? 'pb-24' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight">Image Master Suite</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Professional tools for everyday tasks</p>
        </header>

        <div className="hidden md:flex justify-center mb-4">
          <LeaderboardAd />
        </div>
        <div className="md:hidden flex justify-center mb-4">
          <MobileBannerAd />
        </div>

        <div className="grid lg:grid-cols-[1fr_auto] gap-6">
          <div>
            <div className="flex flex-wrap justify-center gap-2 mb-6 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 w-fit mx-auto">
              {[
                { id: 'photo-maker', icon: Layout, label: 'Passport Photo' },
                { id: 'bg-remover', icon: Eraser, label: 'BG Remover' },
                { id: 'overlay', icon: Layers, label: 'Overlay' },
                { id: 'resizer', icon: Maximize2, label: 'Resizer' },
                { id: 'joiner', icon: Columns, label: 'Joiner' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="transition-all duration-300">
              {renderContent()}
            </div>
          </div>

          <div className="hidden xl:flex justify-center">
            <SidebarAd />
          </div>
        </div>

        <div className="md:hidden flex justify-center mt-8">
          <MobileBannerAd />
        </div>
      
      </div>
    </div>
    </div>
    );
  };

  return <ImageEditorContent />;
}

const PhotoMakerTool = ({ sharedImage, setSharedImage }) => {
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
      if(sharedImage && !image) setImage(sharedImage);
  }, [sharedImage]);

  const processImage = (img) => {
      setImage(img);
      setSharedImage(img); 
      setSettings(prev => ({...prev, panX: 0, panY: 0, rotation: 0}));
  };

  useEffect(() => {
    const handlePaste = (e) => getClipboardImage(e, processImage);
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if(file){
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

    canvas.width = paper.w;
    canvas.height = paper.h;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, paper.w, paper.h);

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
            settings.borderWidth/2, 
            settings.borderWidth/2, 
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
        if (x + photo.w < paper.w && y + photo.h < paper.h) {
          ctx.drawImage(tempCanvas, x, y);
          ctx.strokeStyle = '#eeeeee';
          ctx.lineWidth = 1;
          ctx.strokeRect(x - 1, y - 1, photo.w + 2, photo.h + 2);
        }
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
    setSettings(prev => ({...prev, rows: r, cols: c}));
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
                    <label className="text-xs font-bold text-gray-500 mb-1 block">PAPER</label>
                    <select value={settings.paperSize} onChange={(e) => setSettings({...settings, paperSize: e.target.value})} className="w-full p-2 text-sm border rounded bg-white dark:bg-slate-700">
                      {Object.entries(PAPER_SIZES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">SIZE</label>
                    <select value={settings.photoSize} onChange={(e) => setSettings({...settings, photoSize: e.target.value})} className="w-full p-2 text-sm border rounded bg-white dark:bg-slate-700">
                      {Object.entries(PHOTO_SIZES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                 </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-600 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><RotateCcw size={12}/> ADJUST PHOTO</span>
                  </div>
                  
                  <div>
                      <div className="flex justify-between mb-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><RotateCcw size={10}/> Rotate</span>
                          <span>{settings.rotation}°</span>
                      </div>
                      <input 
                        type="range" min="-45" max="45" value={settings.rotation} 
                        onChange={(e) => setSettings({...settings, rotation: Number(e.target.value)})}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                      <div>
                          <div className="flex justify-between mb-1 text-xs text-gray-500">
                             <span className="flex items-center gap-1"><ArrowRightLeft size={10}/> Move X</span>
                          </div>
                          <input 
                            type="range" min="-150" max="150" value={settings.panX} 
                            onChange={(e) => setSettings({...settings, panX: Number(e.target.value)})}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                      </div>
                      <div>
                          <div className="flex justify-between mb-1 text-xs text-gray-500">
                             <span className="flex items-center gap-1"><ArrowUpDown size={10}/> Move Y</span>
                          </div>
                          <input 
                            type="range" min="-150" max="150" value={settings.panY} 
                            onChange={(e) => setSettings({...settings, panY: Number(e.target.value)})}
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
                             <span className="flex items-center gap-1"><Grid3X3 size={10}/> Grid X</span>
                          </div>
                          <input 
                            type="range" min="-100" max="300" value={settings.sheetX || 0} 
                            onChange={(e) => setSettings({...settings, sheetX: Number(e.target.value)})}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                      </div>
                      <div>
                          <div className="flex justify-between mb-1 text-xs text-gray-500">
                             <span className="flex items-center gap-1"><Grid3X3 size={10}/> Grid Y</span>
                          </div>
                          <input 
                            type="range" min="-100" max="300" value={settings.sheetY || 0} 
                            onChange={(e) => setSettings({...settings, sheetY: Number(e.target.value)})}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                      </div>
                  </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-600 pt-3">
                  <span className="text-xs font-bold text-gray-500 block mb-2">BORDER STYLING</span>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                        <Slider label="Thickness" value={settings.borderWidth} min={0} max={20} onChange={(v) => setSettings({...settings, borderWidth: v})} unit="px" />
                    </div>
                    <div>
                        <input type="color" value={settings.borderColor} onChange={(e) => setSettings({...settings, borderColor: e.target.value})} className="h-8 w-8 rounded cursor-pointer border-0" />
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">ROWS</label>
                    <input type="number" value={settings.rows} onChange={(e) => setSettings({...settings, rows: Number(e.target.value)})} className="w-full p-1.5 text-sm border rounded" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">COLS</label>
                    <input type="number" value={settings.cols} onChange={(e) => setSettings({...settings, cols: Number(e.target.value)})} className="w-full p-1.5 text-sm border rounded" />
                 </div>
              </div>
              <Button onClick={autoFit} variant="secondary" className="w-full text-xs">Fill Sheet Max</Button>
              <Slider label="Gap" value={settings.gap} min={0} max={50} onChange={(v) => setSettings({...settings, gap: v})} unit="px" />
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

const BgRemover = ({ sharedImage, setSharedImage }) => {
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
  const [lastMagicClick, setLastMagicClick] = useState(null); // Realtime tolerance state
  
  const [dateSettings, setDateSettings] = useState({
      show: false,
      text: '',
      style: 'slate',
      bgSlate: '#222222'
  });

  useEffect(() => {
      if(sharedImage && !image) processLoadedImage(sharedImage);
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

  // Realtime tolerance effect
  useEffect(() => {
      if (lastMagicClick && tool === 'magic') {
          const wk = workCanvasRef.current;
          const ctx = wk.getContext('2d');
          
          // 1. Restore state before the last click (clean base)
          ctx.putImageData(lastMagicClick.data, 0, 0);
          
          // 2. Re-apply removal with new tolerance
          applyMagicWand(ctx, lastMagicClick.data, lastMagicClick.x, lastMagicClick.y, tolerance);
          
          // 3. Update Visuals
          updateDisplay();
          
          // 4. Update History (Replace last entry to keep Undo clean)
          setHistory(prev => {
              const newHist = [...prev];
              if (newHist.length > 0) {
                  newHist[newHist.length - 1] = ctx.getImageData(0,0, wk.width, wk.height);
              }
              return newHist;
          });
      }
  }, [tolerance]);

  useEffect(() => {
      if(image) updateDisplay();
  }, [dateSettings, bgColor, isTransparent]);

  const saveState = () => {
     const wk = workCanvasRef.current;
     if(!wk) return;
     const ctx = wk.getContext('2d');
     const data = ctx.getImageData(0,0, wk.width, wk.height);
     setHistory(prev => [...prev.slice(-4), data]);
  };

  const undo = () => {
      setLastMagicClick(null); // Reset realtime tracker on undo
      if(history.length <= 1) return;
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

  // Separated Logic for Reuse
  const applyMagicWand = (ctx, baseImageData, x, y, t) => {
      const w = baseImageData.width;
      const h = baseImageData.height;
      // Work on a copy/clone of data to not pollute baseImageData
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
    
    // Capture clean state BEFORE modification
    const cleanData = ctx.getImageData(0, 0, wk.width, wk.height);
    setLastMagicClick({ x, y, data: cleanData });

    // Perform op
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
      setLastMagicClick(null); // Clear magic tracking if switching actions
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
      const {x, y} = getPos(e);
      
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
      if(canvasRef.current) {
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
                      <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><Calendar size={12}/> NAME / DOB</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={dateSettings.show} onChange={(e) => setDateSettings({...dateSettings, show: e.target.checked})} />
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
                            onChange={(e) => setDateSettings({...dateSettings, text: e.target.value})}
                          />
                          <div className="flex gap-2 text-xs">
                              <button 
                                onClick={() => setDateSettings({...dateSettings, style: 'slate'})}
                                className={`flex-1 py-1 px-2 rounded border flex items-center justify-center gap-1 ${dateSettings.style === 'slate' ? 'ring-2 ring-blue-500 border-transparent bg-blue-50' : 'border-gray-300'}`}
                              >
                                  <div className="w-3 h-3 bg-black border border-gray-500 rounded-sm"></div> Slate
                              </button>
                              <button 
                                onClick={() => setDateSettings({...dateSettings, style: 'white'})}
                                className={`flex-1 py-1 px-2 rounded border flex items-center justify-center gap-1 ${dateSettings.style === 'white' ? 'ring-2 ring-blue-500 border-transparent bg-blue-50' : 'border-gray-300'}`}
                              >
                                  <div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div> White
                              </button>
                          </div>
                          {dateSettings.style === 'slate' && (
                              <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-gray-500">Slate Color:</span>
                                  <input type="color" value={dateSettings.bgSlate} onChange={(e) => setDateSettings({...dateSettings, bgSlate: e.target.value})} className="h-4 w-8 border-0 p-0" />
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

const OverlayTool = ({ sharedImage, setSharedImage }) => {
  const canvasRef = useRef(null);
  const [baseImage, setBaseImage] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [settings, setSettings] = useState({ x: 50, y: 50, scale: 0.5, opacity: 1 });
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
      if(sharedImage && !baseImage) setBaseImage(sharedImage);
  }, [sharedImage]);

  const handleImageLoad = (e, type) => {
    const file = e.target.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
            if(type === 'base') {
                setBaseImage(img);
                setSharedImage(img); 
            } else {
                setOverlayImage(img);
            }
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !baseImage) return;
    const canvas = canvasRef.current;
    canvas.width = baseImage.width;
    canvas.height = baseImage.height;
    const ctx = canvas.getContext('2d');
    
    ctx.globalAlpha = 1;
    ctx.drawImage(baseImage, 0, 0);

    if (overlayImage) {
      ctx.globalAlpha = settings.opacity;
      const w = overlayImage.width * settings.scale;
      const h = overlayImage.height * settings.scale;
      const x = (canvas.width * settings.x / 100) - (w/2);
      const y = (canvas.height * settings.y / 100) - (h/2);
      ctx.drawImage(overlayImage, x, y, w, h);
      
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(x, y, w, h);
    }
  }, [baseImage, overlayImage, settings]);

  const handleDrag = (e) => {
      if(!isDragging || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setSettings(prev => ({...prev, x, y}));
  }

  const saveToWorkspace = () => {
      if(canvasRef.current) {
          setSharedImage(canvasRef.current.toDataURL());
      }
  };

  return (
    <Card>
       <div className="grid md:grid-cols-3 gap-6">
           <div className="space-y-4 order-2 md:order-1">
               <div className="space-y-2">
                   <p className="text-xs font-bold text-gray-500">1. BACKGROUND</p>
                   <ImageUploader label="Base Image" image={baseImage} onUpload={(e) => handleImageLoad(e, 'base')} onRemove={() => setBaseImage(null)} />
               </div>
               <div className="space-y-2">
                   <p className="text-xs font-bold text-gray-500">2. OVERLAY (Sticker/Logo)</p>
                   <ImageUploader label="Overlay Image" image={overlayImage} onUpload={(e) => handleImageLoad(e, 'overlay')} onRemove={() => setOverlayImage(null)} />
               </div>
               {overlayImage && (
                   <div className="bg-slate-50 p-3 rounded space-y-2">
                       <Slider label="Size" value={settings.scale} min={0.1} max={2} onChange={(v) => setSettings({...settings, scale: v})} />
                       <Slider label="Opacity" value={settings.opacity} min={0.1} max={1} onChange={(v) => setSettings({...settings, opacity: v})} />
                       <div className="grid grid-cols-2 gap-2 mt-2">
                           <div>
                               <label className="text-xs text-gray-500 flex items-center gap-1"><ArrowRightLeft size={10}/> Pos X</label>
                               <input type="range" min="0" max="100" value={settings.x} onChange={e => setSettings({...settings, x: Number(e.target.value)})} className="w-full h-1.5 bg-gray-200 rounded-lg" />
                           </div>
                           <div>
                               <label className="text-xs text-gray-500 flex items-center gap-1"><ArrowUpDown size={10}/> Pos Y</label>
                               <input type="range" min="0" max="100" value={settings.y} onChange={e => setSettings({...settings, y: Number(e.target.value)})} className="w-full h-1.5 bg-gray-200 rounded-lg" />
                           </div>
                       </div>
                       <p className="text-[10px] text-gray-500 mt-2">Drag image on preview to move.</p>
                   </div>
               )}
               <div className="flex flex-col gap-2">
                   <Button onClick={() => {
                       const link = document.createElement('a');
                       link.download = 'overlay-result.png';
                       link.href = canvasRef.current.toDataURL();
                       link.click();
                   }} disabled={!baseImage} className="w-full"><Download size={16}/> Download</Button>
                   <Button onClick={saveToWorkspace} className="w-full bg-blue-700 hover:bg-blue-800" disabled={!baseImage}>
                      <Save size={14} /> Save Changes to App
                   </Button>
               </div>
           </div>
           <div className="md:col-span-2 order-1 md:order-2 bg-gray-200 rounded-xl flex items-center justify-center p-4 min-h-100">
               <canvas 
                ref={canvasRef} 
                className="max-w-full max-h-125 shadow-lg cursor-move"
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onMouseMove={handleDrag}
               />
               {!baseImage && <span className="text-gray-400">Preview</span>}
           </div>
       </div>
    </Card>
  );
};

const ResizerTool = ({ sharedImage, setSharedImage }) => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [dims, setDims] = useState({w: 0, h: 0});
  const [lockRatio, setLockRatio] = useState(true);
  const [transform, setTransform] = useState({ scale: 1, panX: 0, panY: 0 });
  const [dateSettings, setDateSettings] = useState({
      show: false, text: '', style: 'slate', bgSlate: '#222222'
  });

  useEffect(() => {
      if(sharedImage && !image) process(sharedImage);
  }, [sharedImage]);

  const process = (img) => {
      setImage(img);
      setDims({w: img.width, h: img.height});
      setTransform({ scale: 1, panX: 0, panY: 0 });
  }

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
            process(img);
            setSharedImage(img); 
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const updateDim = (key, val) => {
      if(lockRatio && image) {
          const ratio = image.width / image.height;
          if(key === 'w') setDims({w: val, h: Math.round(val / ratio)});
          else setDims({h: val, w: Math.round(val * ratio)});
      } else {
          setDims(prev => ({...prev, [key]: val}));
      }
  }

  useEffect(() => {
     if(!canvasRef.current || !image) return;
     const canvas = canvasRef.current;
     canvas.width = dims.w;
     canvas.height = dims.h;
     const ctx = canvas.getContext('2d');
     
     ctx.clearRect(0, 0, dims.w, dims.h);
     
     ctx.save();
     ctx.translate(dims.w / 2, dims.h / 2);
     ctx.scale(transform.scale, transform.scale);
     ctx.translate(-dims.w / 2 + transform.panX, -dims.h / 2 + transform.panY);
     
     ctx.drawImage(image, 0, 0, dims.w, dims.h);
     ctx.restore();

     if (dateSettings.show && dateSettings.text) {
        drawDateOverlay(
            ctx, 
            dims.w, 
            dims.h, 
            dateSettings.text, 
            dateSettings.style, 
            dateSettings.bgSlate
        );
    }

  }, [image, dims, transform, dateSettings]);

  const download = () => {
      const link = document.createElement('a');
      link.download = `resized-${dims.w}x${dims.h}.png`;
      link.href = canvasRef.current.toDataURL('image/png', 0.9);
      link.click();
  }

  const saveToWorkspace = () => {
      if(canvasRef.current) {
          setSharedImage(canvasRef.current.toDataURL());
      }
  };

  return (
      <Card>
          <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 space-y-6">
                  <ImageUploader label="Upload Image" image={image} onUpload={handleUpload} onRemove={() => setImage(null)} />
                  {image && (
                      <div className="bg-slate-50 p-4 rounded-xl space-y-4 border">
                          <div className="flex items-center justify-between">
                             <h3 className="font-bold text-gray-700">New Dimensions</h3>
                             <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={lockRatio} onChange={e => setLockRatio(e.target.checked)}/> Lock Ratio</label>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-bold text-gray-500">WIDTH</label>
                                  <input type="number" value={dims.w} onChange={e => updateDim('w', Number(e.target.value))} className="w-full p-2 border rounded" />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500">HEIGHT</label>
                                  <input type="number" value={dims.h} onChange={e => updateDim('h', Number(e.target.value))} className="w-full p-2 border rounded" />
                              </div>
                          </div>

                          <div className="border-t pt-3 mt-2">
                             <h4 className="text-xs font-bold text-gray-500 mb-2">ADJUST POSITION</h4>
                             <Slider label="Scale" value={transform.scale} min={0.1} max={3} onChange={v => setTransform({...transform, scale: v})} />
                             <div className="grid grid-cols-2 gap-2">
                                <Slider label="Pan X" value={transform.panX} min={-500} max={500} onChange={v => setTransform({...transform, panX: v})} />
                                <Slider label="Pan Y" value={transform.panY} min={-500} max={500} onChange={v => setTransform({...transform, panY: v})} />
                             </div>
                          </div>

                          <div className="border-t border-gray-200 dark:border-slate-600 pt-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><Calendar size={12}/> NAME / DOB</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={dateSettings.show} onChange={(e) => setDateSettings({...dateSettings, show: e.target.checked})} />
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
                                        onChange={(e) => setDateSettings({...dateSettings, text: e.target.value})}
                                    />
                                    <div className="flex gap-2 text-xs">
                                        <button 
                                            onClick={() => setDateSettings({...dateSettings, style: 'slate'})}
                                            className={`flex-1 py-1 px-2 rounded border flex items-center justify-center gap-1 ${dateSettings.style === 'slate' ? 'ring-2 ring-blue-500 border-transparent bg-blue-50' : 'border-gray-300'}`}
                                        >
                                            <div className="w-3 h-3 bg-black border border-gray-500 rounded-sm"></div> Slate
                                        </button>
                                        <button 
                                            onClick={() => setDateSettings({...dateSettings, style: 'white'})}
                                            className={`flex-1 py-1 px-2 rounded border flex items-center justify-center gap-1 ${dateSettings.style === 'white' ? 'ring-2 ring-blue-500 border-transparent bg-blue-50' : 'border-gray-300'}`}
                                        >
                                            <div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div> White
                                        </button>
                                    </div>
                                </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                              <Button onClick={download} className="w-full"><Download size={16}/> Download Resized</Button>
                              <Button onClick={saveToWorkspace} className="w-full bg-blue-700 hover:bg-blue-800">
                                  <Save size={14} /> Save Changes to App
                              </Button>
                          </div>
                      </div>
                  )}
              </div>
              <div className="w-full md:w-2/3 bg-gray-200 rounded-xl flex items-center justify-center p-4 min-h-100">
                  <canvas ref={canvasRef} className={`max-w-full max-h-125 shadow-lg ${!image ? 'hidden' : ''}`} />
                  {!image && <span className="text-gray-400">Preview</span>}
              </div>
          </div>
      </Card>
  )
}

const JoinerTool = ({ sharedImage, setSharedImage }) => {
    const canvasRef = useRef(null);
    const [images, setImages] = useState({img1: null, img2: null});
    const [direction, setDirection] = useState('horizontal');
    const [gap, setGap] = useState(0);

    useEffect(() => {
        if(sharedImage && !images.img1) setImages(prev => ({...prev, img1: sharedImage}));
    }, [sharedImage]);

    const handleUpload = (e, key) => {
        const file = e.target.files[0];
        if(file){
            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.onload = () => {
                    setImages(prev => ({...prev, [key]: img}));
                    setSharedImage(img); 
                };
                img.src = evt.target.result;
            }
            reader.readAsDataURL(file);
        }
    }

    useEffect(() => {
        if(!canvasRef.current || (!images.img1 && !images.img2)) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const {img1, img2} = images;

        const w1 = img1?.width || 0;
        const h1 = img1?.height || 0;
        const w2 = img2?.width || 0;
        const h2 = img2?.height || 0;

        if(direction === 'horizontal') {
             canvas.width = w1 + w2 + gap;
             canvas.height = Math.max(h1, h2);
             ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width, canvas.height);
             if(img1) ctx.drawImage(img1, 0, 0);
             if(img2) ctx.drawImage(img2, w1 + gap, 0);
        } else {
             canvas.width = Math.max(w1, w2);
             canvas.height = h1 + h2 + gap;
             ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width, canvas.height);
             if(img1) ctx.drawImage(img1, 0, 0);
             if(img2) ctx.drawImage(img2, 0, h1 + gap);
        }

    }, [images, direction, gap]);

    const saveToWorkspace = () => {
      if(canvasRef.current) {
          setSharedImage(canvasRef.current.toDataURL());
      }
    };

    return (
        <Card>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <ImageUploader label="Image 1 (Left/Top)" image={images.img1} onUpload={e => handleUpload(e, 'img1')} onRemove={() => setImages(p => ({...p, img1: null}))} />
                    <ImageUploader label="Image 2 (Right/Bottom)" image={images.img2} onUpload={e => handleUpload(e, 'img2')} onRemove={() => setImages(p => ({...p, img2: null}))} />
                    <div className="flex gap-2 bg-slate-50 p-2 rounded">
                        <Button variant={direction === 'horizontal' ? 'primary' : 'secondary'} onClick={() => setDirection('horizontal')} className="flex-1 text-xs">Side by Side</Button>
                        <Button variant={direction === 'vertical' ? 'primary' : 'secondary'} onClick={() => setDirection('vertical')} className="flex-1 text-xs">Top & Bottom</Button>
                    </div>
                    <Slider label="Gap" value={gap} min={0} max={100} onChange={setGap} />
                    <div className="flex flex-col gap-2">
                        <Button onClick={() => {
                            const link = document.createElement('a');
                            link.download = 'joined.png';
                            link.href = canvasRef.current.toDataURL();
                            link.click();
                        }} disabled={!images.img1 && !images.img2} className="w-full">Download Joined</Button>
                        <Button onClick={saveToWorkspace} className="w-full bg-blue-700 hover:bg-blue-800" disabled={!images.img1 && !images.img2}>
                            <Save size={14} /> Save Changes to App
                        </Button>
                    </div>
                </div>
                <div className="md:col-span-2 bg-gray-200 rounded-xl flex items-center justify-center p-4 min-h-100">
                    <canvas ref={canvasRef} className={`max-w-full max-h-125 shadow-lg ${(!images.img1 && !images.img2) ? 'hidden' : ''}`} />
                    {(!images.img1 && !images.img2) && <span className="text-gray-400">Preview</span>}
                </div>
            </div>
        </Card>
    )
}