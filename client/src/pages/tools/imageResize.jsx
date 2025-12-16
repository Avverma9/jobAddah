import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Layers, 
  Maximize2, 
  Download, 
  Trash2, 
  Columns,
  Rows,
  Eraser,
  Check,
  RefreshCw,
  Clipboard,
  Scaling,
  Palette,
  Move,
  Scissors,
  X,
  Layout,
  Printer
} from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-lg p-3 md:p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = "primary", className = "", disabled = false }) => {
  const baseStyle = "px-3 py-2 text-xs md:text-base md:px-4 md:py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500"
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Slider = ({ label, value, min, max, onChange }) => (
  <div className="mb-2 md:mb-4">
    <div className="flex justify-between mb-1">
      <span className="text-xs md:text-sm font-medium text-gray-700">{label}</span>
      <span className="text-xs md:text-sm text-gray-500">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 md:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
  </div>
);

const ImageUploader = ({ label, image, onUpload, onRemove }) => {
  if (image) {
    return (
      <div className="bg-white border border-blue-100 rounded-lg p-2 md:p-3 flex items-center justify-between shadow-sm animate-fade-in">
        <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0 border border-gray-200">
                <img src={image.src} alt="thumbnail" className="w-full h-full object-cover rounded-md" />
            </div>
            <div className="min-w-0">
                <p className="text-xs md:text-sm font-bold text-gray-700 truncate">{label}</p>
                <p className="text-[10px] md:text-xs text-green-600 font-medium flex items-center gap-1">
                  <Check size={10} /> Loaded
                </p>
            </div>
        </div>
        <div className="flex gap-1 md:gap-2">
            <label className="cursor-pointer p-1.5 md:p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors flex flex-col items-center" title="Replace Image">
                <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
                <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
            </label>
            <button onClick={onRemove} className="p-1.5 md:p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors flex flex-col items-center" title="Remove Image">
                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
        </div>
      </div>
    );
  }

  return (
    <label className="flex flex-col items-center justify-center p-3 md:p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group h-20 md:h-32 bg-gray-50 relative overflow-hidden">
      <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-gray-100 text-gray-500 text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
        Ctrl+V
      </div>
      <Upload className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-blue-500 mb-1 md:mb-2 transition-transform group-hover:-translate-y-1" />
      <span className="text-xs md:text-sm font-medium text-gray-500 group-hover:text-blue-600 text-center leading-tight">{label}</span>
      <span className="hidden md:block text-xs text-gray-400 mt-1">Click / Paste</span>
      <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
    </label>
  );
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
  const [activeTab, setActiveTab] = useState('photo-maker');
  
  const renderContent = () => {
    switch(activeTab) {
      case 'photo-maker': return <PhotoMakerTool />;
      case 'bg-remover': return <BgRemover />;
      case 'overlay': return <OverlayTool />;
      case 'resizer': return <ResizerTool />;
      case 'joiner': return <JoinerTool />;
      default: return <PhotoMakerTool />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-4 md:mb-8 text-center">
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-1 md:mb-2">Image Master Pro</h1>
          <p className="text-xs md:text-base text-gray-500 mb-3 md:mb-4">Passport Photos, Edit, Overlay & Resize Tool</p>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-sm font-medium border border-blue-100">
            <Clipboard className="w-3 h-3 md:w-4 md:h-4" />
            <span>Paste (Ctrl+V) Supported</span>
          </div>
        </header>

        <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-4 md:mb-8">
          {[
            { id: 'photo-maker', icon: Layout, label: 'Photo Maker' },
            { id: 'bg-remover', icon: Eraser, label: 'Remover' },
            { id: 'overlay', icon: Layers, label: 'Overlay' },
            { id: 'resizer', icon: Maximize2, label: 'Resizer' },
            { id: 'joiner', icon: Columns, label: 'Joiner' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 md:gap-2 px-3 py-2 md:px-6 md:py-3 rounded-full font-semibold transition-all text-xs md:text-base ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg scale-105' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="transition-all duration-300">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

const PhotoMakerTool = () => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [settings, setSettings] = useState({
    paperSize: 'a4', // a4, 4x6, 5x7
    photoSize: 'passport', // passport, stamp, pan, custom
    rows: 6,
    cols: 5,
    gap: 10, // px
    margin: 20 // px
  });

  // Dimensions in pixels (scaled)
  const PAPER_SIZES = {
    'a4': { w: 2480, h: 3508, label: 'A4 Paper (21x29.7cm)' }, // 300 DPI
    '4x6': { w: 1200, h: 1800, label: '4x6 Inch (10x15cm)' },
    '5x7': { w: 1500, h: 2100, label: '5x7 Inch (13x18cm)' },
  };

  const PHOTO_SIZES = {
    'passport': { w: 413, h: 531, label: 'Passport (3.5x4.5cm)' }, // 35mm x 45mm @ 300dpi
    'stamp': { w: 236, h: 295, label: 'Stamp (2x2.5cm)' },
    'pan': { w: 295, h: 413, label: 'Pan/Defense (2.5x3.5cm)' },
  };

  const processImage = (img) => {
    setImage(img);
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

    // Set Canvas Size (scaled down for preview, but internal calc is high res)
    // We will draw high res then style it down
    canvas.width = paper.w;
    canvas.height = paper.h;

    // Fill White Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, paper.w, paper.h);

    // Calculate positions
    const { rows, cols, gap, margin } = settings;
    
    const startX = margin;
    const startY = margin;

    // Draw Grid
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (photo.w + gap);
        const y = startY + r * (photo.h + gap);
        
        // Ensure we don't draw outside paper
        if (x + photo.w < paper.w && y + photo.h < paper.h) {
          ctx.drawImage(image, x, y, photo.w, photo.h);
          
          // Optional: Cut lines (faint)
          ctx.strokeStyle = '#e5e7eb';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, photo.w, photo.h);
        }
      }
    }

  }, [image, settings]);

  const download = () => {
    const link = document.createElement('a');
    link.download = `printable-sheet-${settings.photoSize}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Helper to auto calc max rows/cols based on paper
  const autoFit = () => {
    const paper = PAPER_SIZES[settings.paperSize];
    const photo = PHOTO_SIZES[settings.photoSize];
    const margin = settings.margin;
    const gap = settings.gap;
    
    const availW = paper.w - (2 * margin);
    const availH = paper.h - (2 * margin);
    
    const c = Math.floor(availW / (photo.w + gap));
    const r = Math.floor(availH / (photo.h + gap));
    
    setSettings(prev => ({...prev, rows: r, cols: c}));
  };

  return (
    <Card>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <div className="w-full md:w-1/3 space-y-3 md:space-y-6 order-2 md:order-1">
          <ImageUploader 
            label="Upload Photo" 
            image={image} 
            onUpload={handleUpload} 
            onRemove={() => setImage(null)}
          />

          {image && (
            <div className="space-y-3 md:space-y-4 bg-gray-50 p-3 md:p-6 rounded-xl animate-fade-in">
              <div className="space-y-3">
                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">PAPER SIZE</label>
                   <select 
                     value={settings.paperSize}
                     onChange={(e) => setSettings({...settings, paperSize: e.target.value})}
                     className="w-full p-2 text-sm border rounded bg-white"
                   >
                     {Object.entries(PAPER_SIZES).map(([k, v]) => (
                       <option key={k} value={k}>{v.label}</option>
                     ))}
                   </select>
                </div>
                
                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">PHOTO TYPE</label>
                   <select 
                     value={settings.photoSize}
                     onChange={(e) => setSettings({...settings, photoSize: e.target.value})}
                     className="w-full p-2 text-sm border rounded bg-white"
                   >
                     {Object.entries(PHOTO_SIZES).map(([k, v]) => (
                       <option key={k} value={k}>{v.label}</option>
                     ))}
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">ROWS</label>
                      <input 
                        type="number" 
                        value={settings.rows}
                        onChange={(e) => setSettings({...settings, rows: Number(e.target.value)})}
                        className="w-full p-2 text-sm border rounded"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">COLUMNS</label>
                      <input 
                        type="number" 
                        value={settings.cols}
                        onChange={(e) => setSettings({...settings, cols: Number(e.target.value)})}
                        className="w-full p-2 text-sm border rounded"
                      />
                   </div>
                </div>

                <Button onClick={autoFit} variant="secondary" className="w-full text-xs">
                   Auto-Fill Sheet (Max Photos)
                </Button>

                <div className="pt-2">
                   <Slider 
                    label="Gap between photos" 
                    value={settings.gap} min={0} max={100} 
                    onChange={(v) => setSettings({...settings, gap: v})}
                   />
                </div>
              </div>

              <Button onClick={download} variant="primary" className="w-full">
                <Printer className="w-4 h-4" /> Download Printable
              </Button>
            </div>
          )}
        </div>
        
        <div className="w-full md:w-2/3 order-1 md:order-2 bg-gray-200 rounded-xl overflow-auto flex items-center justify-center p-2 md:p-4 min-h-[300px] md:min-h-[500px]">
           {/* Preview logic: show image scaled down */}
           <canvas 
             ref={canvasRef} 
             className={`shadow-xl bg-white ${!image ? 'hidden' : ''}`}
             style={{ maxHeight: '500px', maxWidth: '100%', width: 'auto', height: 'auto' }}
           />
           {!image && <p className="text-gray-500 text-sm">Upload a photo to create sheet</p>}
        </div>
      </div>
    </Card>
  );
};

const BgRemover = () => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [tolerance, setTolerance] = useState(30);
  const [selectedColor, setSelectedColor] = useState(null);
  const [originalImageData, setOriginalImageData] = useState(null);
  
  const [isTransparent, setIsTransparent] = useState(true);
  const [bgColor, setBgColor] = useState('#ffffff');

  const processLoadedImage = (img) => {
    setImage(img);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      setOriginalImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
      setSelectedColor(null);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => processLoadedImage(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const handlePaste = (e) => getClipboardImage(e, processLoadedImage);
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleRemoveImage = () => {
    setImage(null);
    setOriginalImageData(null);
    setSelectedColor(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleCanvasClick = (e) => {
    if (!image || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const color = { r: pixel[0], g: pixel[1], b: pixel[2] };
    setSelectedColor(color);
    removeColor(color);
  };

  const removeColor = (targetColor) => {
    if (!originalImageData || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const newData = new ImageData(
      new Uint8ClampedArray(originalImageData.data),
      originalImageData.width,
      originalImageData.height
    );
    
    const data = newData.data;
    const t = tolerance; 

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (
        Math.abs(r - targetColor.r) < t &&
        Math.abs(g - targetColor.g) < t &&
        Math.abs(b - targetColor.b) < t
      ) {
        data[i + 3] = 0;
      }
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(newData, 0, 0);

    if (!isTransparent) {
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
    }
  };

  useEffect(() => {
    if (selectedColor) {
      removeColor(selectedColor);
    }
  }, [tolerance, isTransparent, bgColor]);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = 'bg-removed.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <Card>
      <div className="grid md:grid-cols-3 gap-4 md:gap-8">
        <div className="space-y-3 md:space-y-6 order-2 md:order-1">
          <div className="bg-blue-50 p-2 md:p-4 rounded-lg border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-1 text-xs md:text-base">Instructions</h3>
            <ol className="list-decimal ml-4 text-[10px] md:text-sm text-blue-800 space-y-0.5">
              <li>Image upload/paste karein.</li>
              <li>Background color par click karein.</li>
              <li>Tolerance slider adjust karein.</li>
            </ol>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            <ImageUploader 
              label="Upload Image" 
              image={image} 
              onUpload={handleImageUpload} 
              onRemove={handleRemoveImage}
            />

            {image && (
              <div className="animate-fade-in space-y-3 md:space-y-4">
                <Slider 
                  label="Color Tolerance" 
                  value={tolerance} 
                  min={1} 
                  max={150} 
                  onChange={setTolerance} 
                />

                <div className="bg-gray-50 p-2 md:p-4 rounded-lg border border-gray-200">
                    <h4 className="text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3 flex items-center gap-2">
                        <Palette className="w-4 h-4" /> Background
                    </h4>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="bgType"
                                checked={isTransparent} 
                                onChange={() => setIsTransparent(true)}
                                className="text-blue-600 scale-75 md:scale-100"
                            />
                            <span className="text-xs md:text-sm text-gray-700">Transparent</span>
                        </label>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                  type="radio" 
                                  name="bgType"
                                  checked={!isTransparent} 
                                  onChange={() => setIsTransparent(false)}
                                  className="text-blue-600 scale-75 md:scale-100"
                              />
                              <span className="text-xs md:text-sm text-gray-700">Color</span>
                          </label>
                          {!isTransparent && (
                              <input 
                                  type="color" 
                                  value={bgColor}
                                  onChange={(e) => setBgColor(e.target.value)}
                                  className="h-6 w-12 md:h-8 md:w-16 cursor-pointer border rounded"
                              />
                          )}
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => {
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.putImageData(originalImageData, 0, 0);
                    setSelectedColor(null);
                  }} variant="secondary" className="flex-1">
                    Reset
                  </Button>
                  <Button onClick={downloadImage} className="flex-1">
                    <Download className="w-4 h-4" /> Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 order-1 md:order-2 bg-gray-100 rounded-lg flex items-center justify-center min-h-[300px] md:min-h-[500px] p-2 md:p-4 relative overflow-hidden bg-checkered">
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
            className={`max-w-full max-h-[300px] md:max-h-[500px] shadow-xl cursor-crosshair object-contain ${!image ? 'hidden' : ''}`}
          />
          {!image && <p className="text-gray-400 text-sm md:text-base">Preview Area</p>}
        </div>
      </div>
    </Card>
  );
};

const OverlayTool = () => {
  const canvasRef = useRef(null);
  const [baseImage, setBaseImage] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [settings, setSettings] = useState({
    x: 0, y: 0, scale: 0.5, opacity: 0.8
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handlePaste = (e) => getClipboardImage(e, (img) => {
        if (!baseImage) {
            setBaseImage(img);
        } else {
            setOverlayImage(img);
        }
    });
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [baseImage]); 

  const handleImageLoad = (e, type) => {
    const file = e.target.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => type === 'base' ? setBaseImage(img) : setOverlayImage(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!baseImage) {
      ctx.clearRect(0,0, canvas.width, canvas.height);
      return;
    }

    canvas.width = baseImage.width;
    canvas.height = baseImage.height;

    ctx.globalAlpha = 1.0;
    ctx.drawImage(baseImage, 0, 0);

    if (overlayImage) {
      ctx.globalAlpha = settings.opacity;
      const w = overlayImage.width * settings.scale;
      const h = overlayImage.height * settings.scale;
      
      const posX = (baseImage.width * settings.x) / 100;
      const posY = (baseImage.height * settings.y) / 100;

      ctx.drawImage(overlayImage, posX, posY, w, h);
      
      if (isDragging) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.strokeRect(posX, posY, w, h);
      }
    }
  }, [baseImage, overlayImage, settings, isDragging]);

  const getCanvasCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e) => {
    if (!overlayImage || !baseImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const coords = getCanvasCoordinates(e, canvas);
    
    const w = overlayImage.width * settings.scale;
    const h = overlayImage.height * settings.scale;
    const posX = (baseImage.width * settings.x) / 100;
    const posY = (baseImage.height * settings.y) / 100;

    if (coords.x >= posX && coords.x <= posX + w && coords.y >= posY && coords.y <= posY + h) {
      setIsDragging(true);
      setDragStart({
        x: coords.x - posX,
        y: coords.y - posY
      });
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !baseImage) return;
    e.preventDefault(); 

    const canvas = canvasRef.current;
    const coords = getCanvasCoordinates(e, canvas);

    let newX = coords.x - dragStart.x;
    let newY = coords.y - dragStart.y;

    const newXPercent = (newX / baseImage.width) * 100;
    const newYPercent = (newY / baseImage.height) * 100;

    setSettings(prev => ({
      ...prev,
      x: newXPercent,
      y: newYPercent
    }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const download = () => {
    const link = document.createElement('a');
    link.download = 'merged-image.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <Card>
      <div className="grid md:grid-cols-3 gap-4 md:gap-8">
        <div className="space-y-3 md:space-y-6 order-2 md:order-1">
          <div className="bg-blue-50 p-2 md:p-3 rounded-lg text-xs md:text-sm text-blue-800 border border-blue-100 mb-2 md:mb-4">
             <strong>Tip:</strong> Paste works! Touch & Drag image to move.
          </div>
          <div className="space-y-2 md:space-y-4">
            <div>
              <label className="text-xs md:text-sm font-medium mb-1 block">1. Base (Back)</label>
              <ImageUploader 
                label="Base Image" 
                image={baseImage} 
                onUpload={(e) => handleImageLoad(e, 'base')} 
                onRemove={() => setBaseImage(null)}
              />
            </div>
            <div>
              <label className="text-xs md:text-sm font-medium mb-1 block">2. Overlay (Front)</label>
              <ImageUploader 
                label="Overlay Image" 
                image={overlayImage} 
                onUpload={(e) => handleImageLoad(e, 'overlay')} 
                onRemove={() => setOverlayImage(null)}
              />
            </div>
          </div>

          {baseImage && overlayImage && (
            <div className="bg-gray-50 p-2 md:p-4 rounded-lg space-y-2 md:space-y-4 animate-fade-in">
              <h4 className="font-semibold text-gray-700 text-xs md:text-base flex items-center gap-2">
                 <Move className="w-4 h-4" /> Controls
              </h4>
              <p className="text-[10px] md:text-xs text-gray-500 italic">Drag image on canvas to move.</p>
              <Slider 
                label="Scale" 
                value={settings.scale} min={0.1} max={2} 
                onChange={(v) => setSettings({...settings, scale: v})} 
              />
              <Slider 
                label="Opacity" 
                value={settings.opacity} min={0} max={1} 
                onChange={(v) => setSettings({...settings, opacity: v})} 
              />
            </div>
          )}

          <Button onClick={download} disabled={!baseImage} className="w-full">
            <Download className="w-4 h-4" /> Save
          </Button>
        </div>

        <div className="md:col-span-2 order-1 md:order-2 bg-gray-200 rounded-lg flex items-center justify-center p-2 md:p-4 min-h-[300px] md:min-h-[500px] overflow-hidden">
          <canvas 
            ref={canvasRef} 
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            className={`max-w-full max-h-[300px] md:max-h-[500px] shadow-xl ${!baseImage ? 'hidden' : ''} ${overlayImage ? 'cursor-move' : ''}`} 
          />
          {!baseImage && <p className="text-gray-500 text-sm">Preview</p>}
        </div>
      </div>
    </Card>
  );
};

const ResizerTool = () => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [aspectRatio, setAspectRatio] = useState(true);
  const [isCropping, setIsCropping] = useState(false);
  const [selection, setSelection] = useState(null); 

  const processImage = (img) => {
    setImage(img);
    setDims({ w: img.width, h: img.height });
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

  const updateDims = (key, value) => {
    let newW = dims.w;
    let newH = dims.h;

    if (key === 'w') {
      newW = value;
      if (aspectRatio && image) {
        newH = Math.round(value * (image.height / image.width));
      }
    } else {
      newH = value;
      if (aspectRatio && image) {
        newW = Math.round(value * (image.width / image.height));
      }
    }
    setDims({ w: newW, h: newH });
  };

  const getCanvasCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
  };

  const startCrop = (e) => {
     if (!isCropping) return;
     const coords = getCanvasCoordinates(e, canvasRef.current);
     setSelection({ startX: coords.x, startY: coords.y, x: coords.x, y: coords.y, w: 0, h: 0, active: true });
  }

  const moveCrop = (e) => {
     if (!isCropping || !selection?.active) return;
     e.preventDefault();
     const coords = getCanvasCoordinates(e, canvasRef.current);
     
     const currentW = coords.x - selection.startX;
     const currentH = coords.y - selection.startY;

     setSelection(prev => ({
       ...prev,
       w: currentW,
       h: currentH,
       x: currentW < 0 ? coords.x : prev.startX,
       y: currentH < 0 ? coords.y : prev.startY
     }));
  }

  const endCrop = () => {
     if (selection) setSelection(prev => ({ ...prev, active: false }));
  }

  const applyCrop = () => {
     if (!selection || selection.w === 0 || selection.h === 0) return;

     const canvas = document.createElement('canvas');
     const absW = Math.abs(selection.w);
     const absH = Math.abs(selection.h);
     canvas.width = absW;
     canvas.height = absH;
     const ctx = canvas.getContext('2d');
     
     // Draw cropped region from the displayed canvas state
     ctx.drawImage(
         canvasRef.current, 
         selection.w > 0 ? selection.x : selection.x, 
         selection.h > 0 ? selection.y : selection.y, 
         absW, absH, 
         0, 0, absW, absH
     );

     const newImg = new Image();
     newImg.onload = () => {
         setImage(newImg);
         setDims({ w: absW, h: absH });
         setIsCropping(false);
         setSelection(null);
     };
     newImg.src = canvas.toDataURL();
  };

  // Draw Logic
  useEffect(() => {
    if (!canvasRef.current || !image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Always ensure canvas matches dims for resizing
    if (canvas.width !== dims.w || canvas.height !== dims.h) {
        canvas.width = dims.w;
        canvas.height = dims.h;
    }

    // Clear and Draw Image
    ctx.clearRect(0,0, dims.w, dims.h);
    ctx.drawImage(image, 0, 0, dims.w, dims.h);

    // Draw Crop Selection
    if (isCropping && selection) {
        ctx.strokeStyle = '#2563eb'; // Blue
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        
        // Normalize rect for drawing
        const drawX = selection.w < 0 ? selection.startX + selection.w : selection.startX;
        const drawY = selection.h < 0 ? selection.startY + selection.h : selection.startY;
        const drawW = Math.abs(selection.w);
        const drawH = Math.abs(selection.h);

        ctx.strokeRect(drawX, drawY, drawW, drawH);
        
        // Dim outside
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.setLineDash([]);
        
        // Draw 4 rectangles around to dim
        ctx.fillRect(0, 0, dims.w, drawY); // Top
        ctx.fillRect(0, drawY + drawH, dims.w, dims.h - (drawY + drawH)); // Bottom
        ctx.fillRect(0, drawY, drawX, drawH); // Left
        ctx.fillRect(drawX + drawW, drawY, dims.w - (drawX + drawW), drawH); // Right
    }
  }, [image, dims, selection, isCropping]);

  const download = () => {
    const link = document.createElement('a');
    link.download = `resized-${dims.w}x${dims.h}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <Card>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <div className="w-full md:w-1/3 space-y-3 md:space-y-6 order-2 md:order-1">
          <ImageUploader 
            label="Upload Image" 
            image={image} 
            onUpload={handleUpload} 
            onRemove={() => { setImage(null); setDims({w:0, h:0}); setIsCropping(false); }}
          />

          {image && (
            <div className="space-y-3 md:space-y-4 bg-gray-50 p-3 md:p-6 rounded-xl animate-fade-in">
              {/* Dimensions Section */}
              {!isCropping ? (
                <>
                    <div className="flex items-center justify-between mb-2 md:mb-4">
                        <h3 className="font-bold text-gray-700 text-xs md:text-base">Dimensions</h3>
                        <label className="flex items-center gap-1.5 text-xs md:text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={aspectRatio} onChange={(e) => setAspectRatio(e.target.checked)} className="rounded text-blue-600 scale-75 md:scale-100" />
                        Lock Ratio
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div>
                            <label className="block text-[10px] md:text-xs font-bold text-gray-500 mb-1">WIDTH (px)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={dims.w} 
                                    onChange={(e) => updateDims('w', Number(e.target.value))}
                                    className="w-full p-1.5 md:p-2 pr-6 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">px</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] md:text-xs font-bold text-gray-500 mb-1">HEIGHT (px)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={dims.h} 
                                    onChange={(e) => updateDims('h', Number(e.target.value))}
                                    className="w-full p-1.5 md:p-2 pr-6 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">px</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 md:pt-4">
                        <Button onClick={() => setIsCropping(true)} variant="secondary">
                            <Scissors className="w-4 h-4" /> Crop Image
                        </Button>
                        <Button onClick={download} variant="primary">Download</Button>
                    </div>
                </>
              ) : (
                  <div className="space-y-4">
                      <div className="bg-blue-100 text-blue-800 p-2 rounded text-xs md:text-sm text-center font-medium">
                          Draw a box on image to crop
                      </div>
                      <div className="flex gap-2">
                          <Button onClick={applyCrop} className="flex-1 bg-green-600 hover:bg-green-700">
                             <Check className="w-4 h-4" /> Apply
                          </Button>
                          <Button onClick={() => { setIsCropping(false); setSelection(null); }} className="flex-1 bg-gray-500 hover:bg-gray-600">
                             <X className="w-4 h-4" /> Cancel
                          </Button>
                      </div>
                  </div>
              )}
            </div>
          )}
        </div>
        
        <div className="w-full md:w-2/3 order-1 md:order-2 bg-gray-200 rounded-xl overflow-auto flex items-center justify-center p-2 md:p-4 min-h-[300px] md:min-h-[400px]">
           <canvas 
                ref={canvasRef} 
                onMouseDown={startCrop}
                onMouseMove={moveCrop}
                onMouseUp={endCrop}
                onMouseLeave={endCrop}
                onTouchStart={startCrop}
                onTouchMove={moveCrop}
                onTouchEnd={endCrop}
                className={`shadow-lg max-w-full ${!image ? 'hidden' : ''} ${isCropping ? 'cursor-crosshair' : ''}`} 
            />
           {!image && <p className="text-gray-500 text-sm">Preview</p>}
        </div>
      </div>
    </Card>
  );
};

const JoinerTool = () => {
  const canvasRef = useRef(null);
  const [images, setImages] = useState({ img1: null, img2: null });
  const [direction, setDirection] = useState('horizontal'); 
  const [gap, setGap] = useState(0);
  const [autoResize, setAutoResize] = useState(true);

  useEffect(() => {
    const handlePaste = (e) => getClipboardImage(e, (img) => {
        if (!images.img1) {
            setImages(prev => ({ ...prev, img1: img }));
        } else {
            setImages(prev => ({ ...prev, img2: img }));
        }
    });
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [images]); 

  const handleUpload = (e, key) => {
    const file = e.target.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => setImages(prev => ({ ...prev, [key]: img }));
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { img1, img2 } = images;

    if (!img1 && !img2) {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        return;
    }

    let w = 0, h = 0;
    let w1, h1, w2, h2;
    
    if (img1 && img2 && autoResize) {
        if (direction === 'horizontal') {
            const commonH = Math.max(img1.height, img2.height);
            const scale1 = commonH / img1.height;
            const scale2 = commonH / img2.height;
            
            w1 = img1.width * scale1;
            h1 = commonH;
            w2 = img2.width * scale2;
            h2 = commonH;
            
            w = w1 + w2 + gap;
            h = commonH;
        } else {
            const commonW = Math.max(img1.width, img2.width);
            const scale1 = commonW / img1.width;
            const scale2 = commonW / img2.width;
            
            w1 = commonW;
            h1 = img1.height * scale1;
            w2 = commonW;
            h2 = img2.height * scale2;
            
            w = commonW;
            h = h1 + h2 + gap;
        }
    } else if (img1 && img2) {
        if (direction === 'horizontal') {
            w = img1.width + img2.width + gap;
            h = Math.max(img1.height, img2.height);
            w1 = img1.width; h1 = img1.height;
            w2 = img2.width; h2 = img2.height;
        } else {
            w = Math.max(img1.width, img2.width);
            h = img1.height + img2.height + gap;
            w1 = img1.width; h1 = img1.height;
            w2 = img2.width; h2 = img2.height;
        }
    } else if (img1) {
        w = img1.width; h = img1.height;
        w1 = w; h1 = h;
    } else if (img2) {
        w = img2.width; h = img2.height;
        w2 = w; h2 = h;
    }

    canvas.width = w;
    canvas.height = h;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,w,h);
    
    if (img1) ctx.drawImage(img1, 0, 0, w1, h1);
    
    if (img2) {
        if (img1) {
             if (direction === 'horizontal') {
                ctx.drawImage(img2, w1 + gap, 0, w2, h2);
             } else {
                ctx.drawImage(img2, 0, h1 + gap, w2, h2);
             }
        } else {
            ctx.drawImage(img2, 0, 0, w2, h2);
        }
    }

  }, [images, direction, gap, autoResize]);

  const download = () => {
    const link = document.createElement('a');
    link.download = `joined-${direction}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <Card>
      <div className="grid md:grid-cols-4 gap-4 md:gap-6">
        <div className="md:col-span-1 space-y-3 md:space-y-6 order-2 md:order-1">
           <div className="bg-blue-50 p-2 md:p-3 rounded-lg text-xs md:text-sm text-blue-800 border border-blue-100 mb-2 md:mb-4">
             <strong>Tip:</strong> Paste supported.
          </div>
          <div className="space-y-2 md:space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Image 1</label>
              <ImageUploader 
                label="Upload 1" 
                image={images.img1} 
                onUpload={(e) => handleUpload(e, 'img1')} 
                onRemove={() => setImages(prev => ({...prev, img1: null}))}
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1">Image 2</label>
              <ImageUploader 
                label="Upload 2" 
                image={images.img2} 
                onUpload={(e) => handleUpload(e, 'img2')} 
                onRemove={() => setImages(prev => ({...prev, img2: null}))}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-2 md:p-4 rounded-lg space-y-2 md:space-y-4">
            <h4 className="font-semibold text-gray-700 text-xs md:text-base">Settings</h4>
            <div className="flex gap-2">
              <button 
                onClick={() => setDirection('horizontal')}
                className={`flex-1 py-1.5 md:py-2 rounded-md flex items-center justify-center gap-2 text-xs md:text-base ${direction === 'horizontal' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}
              >
                <Columns className="w-4 h-4" /> Horiz
              </button>
              <button 
                onClick={() => setDirection('vertical')}
                className={`flex-1 py-1.5 md:py-2 rounded-md flex items-center justify-center gap-2 text-xs md:text-base ${direction === 'vertical' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}
              >
                <Rows className="w-4 h-4" /> Vert
              </button>
            </div>
            
            <label className="flex items-center gap-2 p-1.5 md:p-2 border rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                <input 
                  type="checkbox" 
                  checked={autoResize} 
                  onChange={(e) => setAutoResize(e.target.checked)} 
                  className="rounded text-blue-600 w-3 h-3 md:w-4 md:h-4"
                />
                <span className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-700 font-medium">
                   <Maximize2 className="w-3 h-3 md:w-4 md:h-4" /> Auto Match Size
                </span>
            </label>

            <Slider label="Gap" value={gap} min={0} max={100} onChange={setGap} />
          </div>

          <Button onClick={download} disabled={!images.img1 && !images.img2} className="w-full">
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>

        <div className="md:col-span-3 order-1 md:order-2 bg-gray-200 rounded-xl overflow-auto flex items-center justify-center p-2 md:p-4 min-h-[300px] md:min-h-[500px]">
           <canvas ref={canvasRef} className={`shadow-lg max-w-full ${(!images.img1 && !images.img2) ? 'hidden' : ''}`} />
           {(!images.img1 && !images.img2) && <p className="text-gray-500 text-sm">Preview</p>}
        </div>
      </div>
    </Card>
  );
};