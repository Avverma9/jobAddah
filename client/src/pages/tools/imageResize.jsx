import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, Scissors, Maximize2, Eraser, Download, RotateCcw,
  Image as ImageIcon, Check, X, Sliders, Eye, EyeOff,
  Copy, Trash2, Zap, Info, Palette, ArrowLeft, ArrowRight,
  Home
} from 'lucide-react';
import SEO from '../../util/SEO';

const PIXELS_PER_INCH = 96;

const BG_COLORS = [
  { name: 'White', hex: '#FFFFFF', rgb: [255, 255, 255] },
  { name: 'Blue', hex: '#3B82F6', rgb: [59, 130, 246] },
  { name: 'Grey', hex: '#6B7280', rgb: [107, 114, 128] },
  { name: 'Black', hex: '#000000', rgb: [0, 0, 0] },
  { name: 'Red', hex: '#EF4444', rgb: [239, 68, 68] },
  { name: 'Green', hex: '#10B981', rgb: [16, 185, 129] },
];

const ImageEditor = () => {
  // Main State
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(100);
  const [showPreview, setShowPreview] = useState(true);
  const [imageInfo, setImageInfo] = useState({ width: 0, height: 0, format: '' });

  // Tool Configs
  const [cropConfig, setCropConfig] = useState({
    x: 0, y: 0, width: 0, height: 0,
    isDragging: false, startX: 0, startY: 0
  });

  const [resizeConfig, setResizeConfig] = useState({
    width: 0, height: 0, unit: 'px',
    maintainAspectRatio: true, originalWidth: 0, originalHeight: 0
  });

  const [bgRemoveConfig, setBgRemoveConfig] = useState({
    tolerance: 30,
    targetColor: null,
    bgColor: BG_COLORS[0],
    stage: 'idle', // 'idle' -> 'removing' -> 'applying'
    hasRemovedBg: false
  });

  const [adjustConfig, setAdjustConfig] = useState({
    brightness: 100, contrast: 100, saturation: 100,
    hue: 0, blur: 0
  });

  // Refs
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  // ========== FILE HANDLING ==========
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        const imgData = event.target.result;
        setProcessedImage(imgData);
        setImageInfo({
          width: img.width,
          height: img.height,
          format: file.type.split('/')[1].toUpperCase()
        });
        setResizeConfig({
          width: img.width,
          height: img.height,
          unit: 'px',
          maintainAspectRatio: true,
          originalWidth: img.width,
          originalHeight: img.height
        });
        setHistory([imgData]);
        setHistoryIndex(0);
        setActiveTool(null);
        setCropConfig({ x: 0, y: 0, width: 0, height: 0, isDragging: false, startX: 0, startY: 0 });
        setBgRemoveConfig(prev => ({ ...prev, stage: 'idle', hasRemovedBg: false }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ========== HISTORY MANAGEMENT ==========
  const updateHistory = useCallback((newImageData) => {
    const newIndex = historyIndex + 1;
    const newHistory = history.slice(0, newIndex);
    newHistory.push(newImageData);
    
    setHistory(newHistory);
    setHistoryIndex(newIndex);
    setProcessedImage(newImageData);

    const img = new Image();
    img.onload = () => {
      setImageInfo(prev => ({ ...prev, width: img.width, height: img.height }));
      setImage(img);
      setResizeConfig(prev => ({
        ...prev,
        width: img.width,
        height: img.height,
        originalWidth: img.width,
        originalHeight: img.height
      }));
    };
    img.src = newImageData;
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const imgData = history[newIndex];
      setProcessedImage(imgData);
      
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = imgData;
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const imgData = history[newIndex];
      setProcessedImage(imgData);
      
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = imgData;
    }
  };

  const resetImage = () => {
    if (history.length > 0) {
      setHistoryIndex(0);
      setProcessedImage(history[0]);
      setBgRemoveConfig(prev => ({ ...prev, stage: 'idle', hasRemovedBg: false }));
    }
  };

  // ========== RESIZE LOGIC ==========
  const convertDimensions = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'px' && toUnit === 'inch') {
      return (value / PIXELS_PER_INCH).toFixed(2);
    }
    if (fromUnit === 'inch' && toUnit === 'px') {
      return Math.round(value * PIXELS_PER_INCH);
    }
    return value;
  };

  const handleResizeChange = (field, value) => {
    const numValue = parseFloat(value) || 0;

    if (field === 'unit') {
      const convertedWidth = convertDimensions(resizeConfig.width, resizeConfig.unit, value);
      const convertedHeight = convertDimensions(resizeConfig.height, resizeConfig.unit, value);
      setResizeConfig(prev => ({
        ...prev,
        unit: value,
        width: convertedWidth,
        height: convertedHeight
      }));
    } else if (field === 'width') {
      let newHeight = resizeConfig.height;
      if (resizeConfig.maintainAspectRatio && resizeConfig.originalWidth > 0) {
        newHeight = (numValue * resizeConfig.originalHeight) / resizeConfig.originalWidth;
      }
      setResizeConfig(prev => ({
        ...prev,
        width: numValue,
        height: newHeight
      }));
    } else if (field === 'height') {
      let newWidth = resizeConfig.width;
      if (resizeConfig.maintainAspectRatio && resizeConfig.originalHeight > 0) {
        newWidth = (numValue * resizeConfig.originalWidth) / resizeConfig.originalHeight;
      }
      setResizeConfig(prev => ({
        ...prev,
        width: newWidth,
        height: numValue
      }));
    }
  };

  const applyResize = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let finalWidth = resizeConfig.width;
    let finalHeight = resizeConfig.height;

    if (resizeConfig.unit === 'inch') {
      finalWidth = Math.round(resizeConfig.width * PIXELS_PER_INCH);
      finalHeight = Math.round(resizeConfig.height * PIXELS_PER_INCH);
    }

    canvas.width = finalWidth;
    canvas.height = finalHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
      updateHistory(canvas.toDataURL('image/png'));
      setActiveTool(null);
    };
    img.src = processedImage;
  };

  // ========== CROP LOGIC ==========
  const startCrop = (e) => {
    if (activeTool !== 'crop' || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);
    setCropConfig({
      ...cropConfig,
      x, y, width: 0, height: 0,
      isDragging: true, startX: x, startY: y
    });
  };

  const onCropMove = (e) => {
    if (!cropConfig.isDragging || activeTool !== 'crop' || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / (zoom / 100);
    const currentY = (e.clientY - rect.top) / (zoom / 100);
    setCropConfig(prev => ({
      ...prev,
      width: currentX - prev.startX,
      height: currentY - prev.startY
    }));
  };

  const endCrop = () => {
    setCropConfig(prev => ({ ...prev, isDragging: false }));
  };

  const applyCrop = () => {
    if (!imageRef.current) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const imgElement = imageRef.current;
    const scaleX = imgElement.naturalWidth / imgElement.width;
    const scaleY = imgElement.naturalHeight / imgElement.height;

    let { x, y, width, height, startX, startY } = cropConfig;
    if (width < 0) {
      x = startX + width;
      width = Math.abs(width);
    }
    if (height < 0) {
      y = startY + height;
      height = Math.abs(height);
    }

    canvas.width = Math.max(width * scaleX, 1);
    canvas.height = Math.max(height * scaleY, 1);

    ctx.drawImage(
      imgElement,
      x * scaleX, y * scaleY, width * scaleX, height * scaleY,
      0, 0, width * scaleX, height * scaleY
    );

    updateHistory(canvas.toDataURL('image/png'));
    setActiveTool(null);
    setCropConfig({ x: 0, y: 0, width: 0, height: 0, isDragging: false, startX: 0, startY: 0 });
  };

  // ========== BACKGROUND REMOVAL ==========
  const pickColor = (e) => {
    if (activeTool !== 'bg_remove' || bgRemoveConfig.stage !== 'removing' || !imageRef.current) return;
    const imgElement = imageRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);

    const rect = imgElement.getBoundingClientRect();
    const scaleX = imgElement.naturalWidth / imgElement.width;
    const scaleY = imgElement.naturalHeight / imgElement.height;
    const x = Math.max(0, Math.min((e.clientX - rect.left) * scaleX, canvas.width - 1));
    const y = Math.max(0, Math.min((e.clientY - rect.top) * scaleY, canvas.height - 1));

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setBgRemoveConfig(prev => ({
      ...prev,
      targetColor: [pixel[0], pixel[1], pixel[2]]
    }));
  };

  const applyBgRemoval = () => {
    if (!bgRemoveConfig.targetColor) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const [r, g, b] = bgRemoveConfig.targetColor;
      const t = bgRemoveConfig.tolerance;

      for (let i = 0; i < data.length; i += 4) {
        const dist = Math.sqrt(
          Math.pow(data[i] - r, 2) +
          Math.pow(data[i + 1] - g, 2) +
          Math.pow(data[i + 2] - b, 2)
        );

        if (dist < t * 2) {
          data[i + 3] = Math.max(0, data[i + 3] - (dist / (t * 2)) * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      updateHistory(canvas.toDataURL('image/png'));
      setBgRemoveConfig(prev => ({
        ...prev,
        stage: 'applying',
        hasRemovedBg: true
      }));
    };
    img.src = processedImage;
  };

  // ========== APPLY BACKGROUND COLOR ==========
  const applyBgColor = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const [bgR, bgG, bgB] = bgRemoveConfig.bgColor.rgb;
      ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0);

      updateHistory(canvas.toDataURL('image/png'));
      setActiveTool(null);
      setBgRemoveConfig(prev => ({
        ...prev,
        stage: 'idle',
        hasRemovedBg: false
      }));
    };
    img.src = processedImage;
  };

  // ========== ADJUSTMENTS ==========
  const applyAdjustments = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const filters = [
        `brightness(${adjustConfig.brightness}%)`,
        `contrast(${adjustConfig.contrast}%)`,
        `saturate(${adjustConfig.saturation}%)`,
        `hue-rotate(${adjustConfig.hue}deg)`,
        `blur(${adjustConfig.blur}px)`
      ];

      ctx.filter = filters.join(' ');
      ctx.drawImage(img, 0, 0);

      updateHistory(canvas.toDataURL('image/png'));
      setActiveTool(null);
    };
    img.src = processedImage;
  };

  // ========== DOWNLOAD ==========
  const downloadImage = () => {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `edited-image-${timestamp}.png`;
    link.href = processedImage;
    link.click();
  };

  const copyToClipboard = async () => {
    try {
      const blob = await (await fetch(processedImage)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      alert('✅ Image copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const tools = [
    { id: 'crop', icon: Scissors, label: 'Crop', title: 'Crop Image' },
    { id: 'resize', icon: Maximize2, label: 'Resize', title: 'Resize Image' },
    { id: 'bg_remove', icon: Eraser, label: 'Remove BG', title: 'Background Tools' },
    { id: 'adjust', icon: Sliders, label: 'Adjust', title: 'Adjust Settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900 font-sans">
      <SEO
        title="JobsAddah – Professional Image Editor | Crop, Resize, Remove & Replace Background"
        description="JobsAddah Professional Image Editor: Advanced features for cropping, resizing, background removal with color replacement. Perfect for job applications and professional photos."
        keywords="image editor, crop tool, resize image, background remover, photo editor, free image tools"
        canonical="/image-editor"
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Sliders className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobsAddah Image Editor
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {processedImage && (
              <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  title="Undo"
                  className="p-2 rounded hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  title="Redo"
                  className="p-2 rounded hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={resetImage}
                  title="Reset to Original"
                  className="p-2 rounded hover:bg-slate-200 transition-all"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <Upload size={18} />
              <span className="hidden sm:inline">Upload Image</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6 h-[calc(100vh-120px)] overflow-hidden">
        {/* Toolbar - Left Side */}
        <aside className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm p-3 gap-3 w-20">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => processedImage && setActiveTool(tool.id)}
              disabled={!processedImage}
              title={tool.title}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all w-14 h-14 ${
                activeTool === tool.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40'
              }`}
            >
              <tool.icon size={22} strokeWidth={1.5} />
            </button>
          ))}

          <div className="flex-1" />

          {processedImage && (
            <div className="flex flex-col gap-2">
              <button
                onClick={downloadImage}
                title="Download"
                className="p-3 rounded-lg text-green-600 hover:bg-green-50 transition-all"
              >
                <Download size={22} />
              </button>
              <button
                onClick={copyToClipboard}
                title="Copy"
                className="p-3 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
              >
                <Copy size={22} />
              </button>
            </div>
          )}
        </aside>

        {/* Canvas Area - Center */}
        <section className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-center">
          {!processedImage ? (
            <div className="text-center">
              <div className="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-slate-300 border-dashed">
                <ImageIcon size={64} className="text-slate-400" />
              </div>
              <p className="text-xl font-semibold text-slate-800 mb-2">No Image Loaded</p>
              <p className="text-sm text-slate-500 mb-6">Upload an image to start editing</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Choose Image
              </button>
            </div>
          ) : (
            <div
              className="relative"
              style={{ transform: `scale(${zoom / 100})` }}
              onMouseDown={startCrop}
              onMouseMove={onCropMove}
              onMouseUp={endCrop}
              onMouseLeave={endCrop}
            >
              {activeTool === 'bg_remove' && bgRemoveConfig.stage === 'removing' ? (
                <img
                  ref={imageRef}
                  src={processedImage}
                  alt="Workspace"
                  onClick={pickColor}
                  className="max-h-[75vh] max-w-full object-contain rounded-lg border border-slate-300 cursor-copy"
                />
              ) : (
                <img
                  ref={imageRef}
                  src={processedImage}
                  alt="Workspace"
                  className={`max-h-[75vh] max-w-full object-contain rounded-lg border border-slate-300 ${
                    activeTool === 'crop' ? 'cursor-crosshair' : ''
                  }`}
                />
              )}

              {/* Crop Overlay */}
              {activeTool === 'crop' && Math.abs(cropConfig.width) > 5 && (
                <div
                  className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none rounded-lg"
                  style={{
                    left: cropConfig.width > 0 ? cropConfig.x : cropConfig.x + cropConfig.width,
                    top: cropConfig.height > 0 ? cropConfig.y : cropConfig.y + cropConfig.height,
                    width: Math.abs(cropConfig.width),
                    height: Math.abs(cropConfig.height)
                  }}
                >
                  <div className="absolute -top-3 -left-3 w-3 h-3 border-t-2 border-l-2 border-blue-500"></div>
                  <div className="absolute -top-3 -right-3 w-3 h-3 border-t-2 border-r-2 border-blue-500"></div>
                  <div className="absolute -bottom-3 -left-3 w-3 h-3 border-b-2 border-l-2 border-blue-500"></div>
                  <div className="absolute -bottom-3 -right-3 w-3 h-3 border-b-2 border-r-2 border-blue-500"></div>
                </div>
              )}
            </div>
          )}

          {/* Zoom Controls */}
          {processedImage && (
            <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-300 shadow-md">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="text-slate-600 hover:text-slate-900"
              >
                −
              </button>
              <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="text-slate-600 hover:text-slate-900"
              >
                +
              </button>
            </div>
          )}

          {/* Image Info */}
          {processedImage && (
            <div className="absolute top-6 right-6 text-xs bg-white rounded-lg px-3 py-2 border border-slate-300 text-slate-700 shadow-md">
              <div className="flex gap-2 items-center">
                <Info size={14} />
                <span>{imageInfo.width}×{imageInfo.height}px</span>
              </div>
            </div>
          )}
        </section>

        {/* Properties Panel - Right Side */}
        {activeTool && (
          <aside className="w-96 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900">
                {tools.find(t => t.id === activeTool)?.title}
              </h3>
              <button onClick={() => setActiveTool(null)} className="text-slate-500 hover:text-slate-900">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* CROP */}
              {activeTool === 'crop' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">Drag on the image to select the area to crop</p>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Selection Size</p>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">W:</span>
                        <p className="font-mono font-bold text-blue-600">{Math.round(Math.abs(cropConfig.width))}px</p>
                      </div>
                      <div>
                        <span className="text-slate-600">H:</span>
                        <p className="font-mono font-bold text-blue-600">{Math.round(Math.abs(cropConfig.height))}px</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={applyCrop}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex justify-center items-center gap-2 hover:shadow-lg transition-all"
                  >
                    <Check size={18} /> Apply Crop
                  </button>
                </div>
              )}

              {/* RESIZE */}
              {activeTool === 'resize' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-2 block">Unit</label>
                    <select
                      value={resizeConfig.unit}
                      onChange={(e) => handleResizeChange('unit', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="px">Pixels (px)</option>
                      <option value="inch">Inches (in)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-2 block">
                      Width ({resizeConfig.unit})
                    </label>
                    <input
                      type="number"
                      step={resizeConfig.unit === 'inch' ? '0.1' : '1'}
                      value={Math.round(resizeConfig.width * 100) / 100}
                      onChange={(e) => handleResizeChange('width', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-2 block">
                      Height ({resizeConfig.unit})
                    </label>
                    <input
                      type="number"
                      step={resizeConfig.unit === 'inch' ? '0.1' : '1'}
                      value={Math.round(resizeConfig.height * 100) / 100}
                      onChange={(e) => handleResizeChange('height', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer border border-slate-200">
                    <input
                      type="checkbox"
                      checked={resizeConfig.maintainAspectRatio}
                      onChange={(e) => setResizeConfig(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-slate-700">Maintain Aspect Ratio</span>
                  </label>

                  <button
                    onClick={applyResize}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex justify-center items-center gap-2 hover:shadow-lg transition-all"
                  >
                    <Check size={18} /> Apply Resize
                  </button>
                </div>
              )}

              {/* BACKGROUND REMOVAL & COLOR */}
              {activeTool === 'bg_remove' && (
                <div className="space-y-4">
                  {bgRemoveConfig.stage === 'idle' && (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm font-semibold text-slate-900 mb-2">Step 1: Remove Background</p>
                        <p className="text-xs text-slate-600">Click on the background color you want to remove</p>
                      </div>

                      <button
                        onClick={() => setBgRemoveConfig(prev => ({ ...prev, stage: 'removing' }))}
                        className="w-full bg-gradient-to-r from-pink-600 to-red-600 text-white py-3 rounded-lg font-semibold flex justify-center items-center gap-2 hover:shadow-lg transition-all"
                      >
                        <Eraser size={18} /> Start Removing
                      </button>
                    </>
                  )}

                  {bgRemoveConfig.stage === 'removing' && (
                    <>
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <p className="text-sm font-semibold text-slate-900 mb-2">Removing Background</p>
                        <p className="text-xs text-slate-600">Click on the background color in the image</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-lg border-2 border-slate-300 shadow-inner flex-shrink-0"
                          style={{
                            backgroundColor: bgRemoveConfig.targetColor
                              ? `rgb(${bgRemoveConfig.targetColor.join(',')})`
                              : 'transparent'
                          }}
                        ></div>
                        <div>
                          <p className="text-xs text-slate-500">Selected Color</p>
                          <p className="text-sm font-mono text-slate-700">
                            {bgRemoveConfig.targetColor
                              ? `RGB(${bgRemoveConfig.targetColor.join(', ')})`
                              : 'Click to select'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 mb-2 block flex justify-between">
                          <span>Tolerance</span>
                          <span className="text-blue-600">{bgRemoveConfig.tolerance}</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={bgRemoveConfig.tolerance}
                          onChange={(e) =>
                            setBgRemoveConfig(prev => ({ ...prev, tolerance: Number(e.target.value) }))
                          }
                          className="w-full accent-pink-600"
                        />
                      </div>

                      <button
                        onClick={applyBgRemoval}
                        disabled={!bgRemoveConfig.targetColor}
                        className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:shadow-lg disabled:opacity-50 text-white py-3 rounded-lg font-semibold flex justify-center items-center gap-2 transition-all"
                      >
                        <Check size={18} /> Remove Background
                      </button>
                    </>
                  )}

                  {bgRemoveConfig.stage === 'applying' && (
                    <>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-slate-900 mb-2">Step 2: Choose Background Color</p>
                        <p className="text-xs text-slate-600">Select a preset or custom color</p>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-slate-700">Preset Colors</p>
                        <div className="grid grid-cols-3 gap-2">
                          {BG_COLORS.map(color => (
                            <button
                              key={color.hex}
                              onClick={() =>
                                setBgRemoveConfig(prev => ({ ...prev, bgColor: color }))
                              }
                              className={`relative p-3 rounded-lg border-2 transition-all ${
                                bgRemoveConfig.bgColor.hex === color.hex
                                  ? 'border-slate-900 shadow-lg'
                                  : 'border-slate-300 hover:border-slate-400'
                              }`}
                              style={{ backgroundColor: color.hex }}
                            >
                              {bgRemoveConfig.bgColor.hex === color.hex && (
                                <Check size={16} className="text-white drop-shadow-lg absolute top-1 right-1" />
                              )}
                              <span className="text-xs font-semibold text-slate-900 drop-shadow block mt-1">
                                {color.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">Custom Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={bgRemoveConfig.bgColor.hex}
                            onChange={(e) => {
                              const hex = e.target.value;
                              const rgb = [
                                parseInt(hex.slice(1, 3), 16),
                                parseInt(hex.slice(3, 5), 16),
                                parseInt(hex.slice(5, 7), 16)
                              ];
                              setBgRemoveConfig(prev => ({
                                ...prev,
                                bgColor: { name: 'Custom', hex, rgb }
                              }));
                            }}
                            className="w-16 h-10 rounded-lg cursor-pointer border border-slate-300"
                          />
                          <input
                            type="text"
                            value={bgRemoveConfig.bgColor.hex}
                            onChange={(e) => {
                              const hex = e.target.value;
                              if (/^#[0-9A-F]{6}$/i.test(hex)) {
                                const rgb = [
                                  parseInt(hex.slice(1, 3), 16),
                                  parseInt(hex.slice(3, 5), 16),
                                  parseInt(hex.slice(5, 7), 16)
                                ];
                                setBgRemoveConfig(prev => ({
                                  ...prev,
                                  bgColor: { name: 'Custom', hex, rgb }
                                }));
                              }
                            }}
                            placeholder="#FFFFFF"
                            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setBgRemoveConfig(prev => ({
                              ...prev,
                              stage: 'removing',
                              targetColor: null
                            }))
                          }
                          className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900 py-2 rounded-lg font-semibold transition-all"
                        >
                          ← Back
                        </button>
                        <button
                          onClick={applyBgColor}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg font-semibold flex justify-center items-center gap-2 hover:shadow-lg transition-all"
                        >
                          <Palette size={16} /> Apply Color
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ADJUST */}
              {activeTool === 'adjust' && (
                <div className="space-y-5">
                  {[
                    { key: 'brightness', label: 'Brightness', min: 0, max: 200 },
                    { key: 'contrast', label: 'Contrast', min: 0, max: 200 },
                    { key: 'saturation', label: 'Saturation', min: 0, max: 200 },
                    { key: 'hue', label: 'Hue Rotation', min: -180, max: 180 },
                    { key: 'blur', label: 'Blur', min: 0, max: 20 },
                  ].map(({ key, label, min, max }) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-slate-700 mb-2 block flex justify-between">
                        <span>{label}</span>
                        <span className="text-blue-600">
                          {adjustConfig[key]}{key === 'blur' ? 'px' : '%'}
                        </span>
                      </label>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={adjustConfig[key]}
                        onChange={(e) => setAdjustConfig(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  ))}

                  <button
                    onClick={applyAdjustments}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex justify-center items-center gap-2 hover:shadow-lg transition-all"
                  >
                    <Zap size={18} /> Apply Adjustments
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

export default ImageEditor;
