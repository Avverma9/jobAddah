"use client";
import SEO from '@/lib/SEO';

import useIsMobile from '@/hooks/useIsMobile';
import { AlertCircle, Calculator, Check, FileDown, Image as ImageIcon, Plus, RefreshCw, Scissors, Settings, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SidebarAd, MobileBannerAd, LeaderboardAd } from '@/components/ads/AdUnits';

const CropModal = ({ image, onClose, onCrop }) => {
  const canvasRef = useRef(null);
  const [selection, setSelection] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const imgRef = useRef(new Image());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    imgRef.current.src = image.url;
    
    imgRef.current.onload = () => {
      const maxWidth = Math.min(window.innerWidth * 0.8, 1000);
      const maxHeight = Math.min(window.innerHeight * 0.7, 800);
      
      const scaleX = maxWidth / imgRef.current.width;
      const scaleY = maxHeight / imgRef.current.height;
      const newScale = Math.min(scaleX, scaleY, 1);
      
      setScale(newScale);

      canvas.width = imgRef.current.width * newScale;
      canvas.height = imgRef.current.height * newScale;
      
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    };
  }, [image]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    const pos = getPos(e);
    setStartPos(pos);
    setIsDragging(true);
    setSelection({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const pos = getPos(e);
    
    const currentX = Math.max(0, Math.min(pos.x, canvasRef.current.width));
    const currentY = Math.max(0, Math.min(pos.y, canvasRef.current.height));
    
    setSelection({
      x: Math.min(startPos.x, currentX),
      y: Math.min(startPos.y, currentY),
      w: Math.abs(currentX - startPos.x),
      h: Math.abs(currentY - startPos.y)
    });
    draw();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

    if (selection) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, canvas.width, selection.y);
      ctx.fillRect(0, selection.y + selection.h, canvas.width, canvas.height - (selection.y + selection.h));
      ctx.fillRect(0, selection.y, selection.x, selection.h);
      ctx.fillRect(selection.x + selection.w, selection.y, canvas.width - (selection.x + selection.w), selection.h);

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
      
      ctx.strokeStyle = '#000';
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      ctx.strokeRect(selection.x - 1, selection.y - 1, selection.w + 2, selection.h + 2);
    }
  };

  const handleCropConfirm = () => {
    if (!selection || selection.w < 5 || selection.h < 5) {
      alert("Please drag to select an area first.");
      return;
    }
    
    const canvas = document.createElement('canvas');
    const sourceX = selection.x / scale;
    const sourceY = selection.y / scale;
    const sourceW = selection.w / scale;
    const sourceH = selection.h / scale;

    canvas.width = sourceW;
    canvas.height = sourceH;
    
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      imgRef.current,
      sourceX, sourceY, sourceW, sourceH,
      0, 0, sourceW, sourceH
    );

    onCrop(canvas.toDataURL('image/jpeg', 0.95));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl p-4 max-w-6xl w-full flex flex-col max-h-[95vh] border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Scissors size={20} className="text-blue-400"/> Professional Crop
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition"><X size={24} /></button>
        </div>
        
        <div className="flex-1 overflow-auto flex justify-center items-center bg-gray-800/50 rounded-lg border border-gray-700 p-2 relative">
           {!selection && (
             <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-1 rounded-full text-sm pointer-events-none z-10">
               Click and drag to crop
             </div>
           )}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-crosshair shadow-lg"
          />
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-gray-400 text-sm hidden sm:inline">Precise Selection Mode</span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition">Cancel</button>
            <button onClick={handleCropConfirm} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-900/20 transition transform active:scale-95">
              <Check size={18} /> Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PdfToolPage() {
  const isMobile = useIsMobile(640);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const [libLoaded, setLibLoaded] = useState(false);
  const [images, setImages] = useState([]);
  const [quality, setQuality] = useState(0.8);
  const [targetKB, setTargetKB] = useState("");
  const [estimatedSize, setEstimatedSize] = useState(null);
  const [cropTarget, setCropTarget] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [optimizationStatus, setOptimizationStatus] = useState("");
  const jsPdfRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let isActive = true;
    import('jspdf')
      .then((mod) => {
        if (!isActive) return;
        const lib = mod.jsPDF || mod.default || mod;
        jsPdfRef.current = lib;
        setLibLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load jsPDF', err);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          addImage(blob);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const addImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImages(prev => [...prev, {
        id: Date.now() + Math.random(),
        url: e.target.result,
        file: file,
        name: file.name
      }]);
      setEstimatedSize(null);
      setOptimizationStatus("");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    files.forEach(addImage);
    e.target.value = "";
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer ? Array.from(event.dataTransfer.files || []) : [];
    if (!files.length) return;
    files
      .filter((file) => file.type.startsWith("image"))
      .forEach(addImage);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeImage = (id) => {
    setImages(images.filter(img => img.id !== id));
    setEstimatedSize(null);
  };

  const updateImage = (id, newUrl) => {
    setImages(images.map(img => img.id === id ? { ...img, url: newUrl } : img));
    setEstimatedSize(null);
  };

  const replaceImage = (id, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateImage(id, e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const getCompressedDataUrl = async (url, q) => {
      return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const scale = q < 0.3 ? 0.7 : (q < 0.6 ? 0.85 : 1);
              
              canvas.width = img.width * scale;
              canvas.height = img.height * scale;
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', q));
          };
      });
  }

  const generatePDFBlob = async (returnBlob = false, overrideQuality = null) => {
    const jsPDF = jsPdfRef.current;
    if (!jsPDF || images.length === 0) return;
    setProcessing(true);
    
    const currentQuality = overrideQuality !== null ? overrideQuality : quality;

    try {
      const doc = new jsPDF();
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (i > 0) doc.addPage();
        
        let imgData = img.url;

        if (currentQuality < 1.0) {
            imgData = await getCompressedDataUrl(img.url, currentQuality);
        }
        
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }
      
      const blob = doc.output('blob');
      
      if (returnBlob) {
        setProcessing(false);
        return blob;
      } else {
        const fileName = images.length > 1 ? "merged-images.pdf" : "converted-image.pdf";
        doc.save(fileName);
      }
    } catch (error) {
        console.error(error);
        alert("Error generating PDF");
    }
    setProcessing(false);
  };

  const autoOptimize = async () => {
    if (!targetKB || isNaN(targetKB) || images.length === 0) {
        alert("Please enter a valid target size (KB)");
        return;
    }

    setProcessing(true);
    setOptimizationStatus("Optimizing...");
    
    const targetBytes = parseInt(targetKB) * 1024;
    let low = 0.05;
    let high = 1.0;
    let bestQuality = 0.1;
    let bestDiff = Infinity;

    for (let step = 0; step < 5; step++) {
        const mid = (low + high) / 2;
        const blob = await generatePDFBlob(true, mid);
        const size = blob.size;
        
        console.log(`Trying Quality: ${mid.toFixed(2)}, Size: ${(size/1024).toFixed(0)}KB`);

        if (size <= targetBytes) {
            bestQuality = mid;
            low = mid; 
            if (targetBytes - size < bestDiff) {
                bestDiff = targetBytes - size;
            }
        } else {
            high = mid;
        }
    }

    setQuality(bestQuality);
    const finalBlob = await generatePDFBlob(true, bestQuality);
    const finalSizeMB = (finalBlob.size / (1024 * 1024)).toFixed(2);
    const finalSizeKB = (finalBlob.size / 1024).toFixed(0);
    
    setEstimatedSize(`${finalSizeMB} MB (${finalSizeKB} KB)`);
    setOptimizationStatus(`Auto-set Quality to ${Math.round(bestQuality * 100)}%`);
    setProcessing(false);
  };

  const calculateSize = async () => {
    const blob = await generatePDFBlob(true);
    if (blob) {
      const mb = blob.size / (1024 * 1024);
      const kb = blob.size / 1024;
      setEstimatedSize(`${mb.toFixed(2)} MB (${kb.toFixed(0)} KB)`);
    }
  };

  const PdfToolContent = () => {
    if (!hydrated) {
      return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
          <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="text-center mb-10">
              <div className="h-12 bg-gray-200 rounded w-80 mx-auto mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-64 mx-auto"></div>
            </div>
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center mb-10">
              <div className="h-20 bg-gray-200 rounded-full w-20 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-64 mx-auto"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
    <div className={`min-h-screen bg-gray-50 text-gray-800 font-sans ${hydrated && isMobile ? 'pb-24' : ''}`} onPaste={(e) => {}}>
      <SEO
        title="Free Image to PDF Converter | Compress PDF Online - JobsAddah"
        description="Convert images to PDF online for free. Compress PDF size, merge multiple images into single PDF. Perfect for government job applications and document submissions."
        keywords="image to pdf, pdf converter, compress pdf, merge pdf, photo to pdf, jpg to pdf, png to pdf, pdf compressor, free pdf tool"
        canonical="/tools/pdf-tool"
        section="Tools"
      />

      <div className="hidden md:flex justify-center mb-6">
        <LeaderboardAd />
      </div>
      <div className="md:hidden flex justify-center mb-4">
        <MobileBannerAd />
      </div>
      
      {cropTarget && (
        <CropModal 
          image={cropTarget} 
          onClose={() => setCropTarget(null)} 
          onCrop={(newUrl) => {
            updateImage(cropTarget.id, newUrl);
            setCropTarget(null);
          }} 
        />
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-3 flex items-center justify-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg"><FileDown size={32} /></div>
            JobsAddah PDF Tool
          </h1>
          <p className="text-slate-500 text-lg">Batch Converter • Compressor • Editor</p>
        </div>

        <div
          className="bg-white border-2 border-dashed border-blue-200 rounded-2xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all mb-10 cursor-pointer group shadow-sm"
          onClick={openFilePicker}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openFilePicker();
            }
          }}
        >
          <input 
            type="file" 
            multiple 
            accept="image/*"
            className="hidden" 
            id="file-upload"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full h-full">
            <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Upload size={40} className="text-blue-600" />
            </div>
            <span className="text-xl font-semibold text-gray-700">Images Drop karein ya Click karein</span>
          </label>
        </div>

        <span className="block text-sm text-gray-400 mt-2 bg-white px-3 py-1 rounded-full border text-center max-w-xs mx-auto">Ctrl + V Supported</span>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-700">
                <ImageIcon size={20} /> Project Files <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-sm">{images.length}</span>
              </h2>
              {images.length > 0 && (
                 <button onClick={() => setImages([])} className="text-red-500 text-sm hover:bg-red-50 px-3 py-1 rounded transition">Clear All</button>
              )}
            </div>

            {images.length === 0 ? (
               <div className="bg-white rounded-2xl h-64 flex flex-col items-center justify-center text-gray-400 border border-gray-100 shadow-inner">
                  <AlertCircle size={40} className="mb-3 opacity-50" />
                  <p className="font-medium">No images selected</p>
               </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={img.id} className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-200">
                    <div className="aspect-w-3 aspect-h-4 h-48 bg-gray-100 relative">
                        <img src={img.url} alt="preview" className="w-full h-full object-contain p-2" />
                        
                        <div className="absolute inset-0 bg-slate-900/60 transition-opacity opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3">
                           <button onClick={() => setCropTarget(img)} className="bg-white text-slate-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 flex items-center gap-2 transform hover:scale-105 transition">
                               <Scissors size={14} /> Crop
                           </button>
                           <button onClick={() => removeImage(img.id)} className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 flex items-center gap-2 transform hover:scale-105 transition">
                               <Trash2 size={14} /> Remove
                           </button>
                        </div>
                        
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                            #{index + 1}
                        </div>
                    </div>
                    
                    <div className="p-3 bg-white border-t flex justify-between items-center">
                        <div className="relative overflow-hidden w-full">
                            <button className="text-xs font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1 w-full justify-center py-1 bg-slate-50 rounded hover:bg-blue-50 transition">
                                <RefreshCw size={12} /> Replace
                            </button>
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              onChange={(e) => {
                                const file = e.target.files && e.target.files[0];
                                if (file) {
                                  replaceImage(img.id, file);
                                }
                                e.target.value = "";
                              }}
                            />
                        </div>
                    </div>
                  </div>
                ))}
                
                <label
                  htmlFor="file-upload"
                  onClick={(e) => {
                    e.preventDefault();
                    openFilePicker();
                  }}
                  className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition bg-transparent opacity-70 hover:opacity-100"
                >
                    <Plus size={32} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wide">Add More</span>
                </label>
              </div>
            )}
          </div>

          <div className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 border-b pb-3">
                    <Settings size={18} /> Output Settings
                </h3>
                
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-slate-600">Manual Quality</label>
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{Math.round(quality * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0.05" 
                        max="1.0" 
                        step="0.05" 
                        value={quality} 
                        onChange={(e) => {
                            setQuality(parseFloat(e.target.value));
                            setEstimatedSize(null);
                            setOptimizationStatus("");
                        }}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div className="mb-6">
                    <label className="text-sm font-semibold text-slate-600 mb-2 block">Target File Size (KB)</label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            placeholder="e.g. 500" 
                            value={targetKB}
                            onChange={(e) => setTargetKB(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                        />
                        <button 
                            onClick={autoOptimize}
                            disabled={images.length === 0 || !targetKB}
                            className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            title="Auto-adjust quality to fit size"
                        >
                            Auto Fit
                        </button>
                    </div>
                    {optimizationStatus && (
                        <p className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1">
                            <Check size={12} /> {optimizationStatus}
                        </p>
                    )}
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Estimated Size</span>
                        {estimatedSize ? (
                             <span className="text-lg font-bold text-slate-800">{estimatedSize}</span>
                        ) : (
                            <span className="text-sm text-slate-400 italic">--</span>
                        )}
                    </div>
                    <button 
                        onClick={calculateSize}
                        disabled={images.length === 0 || processing}
                        className="text-blue-600 text-xs font-medium hover:underline flex items-center gap-1 mt-1 w-full justify-end"
                    >
                        <Calculator size={12} /> Recalculate Now
                    </button>
                </div>

                <button 
                    onClick={() => generatePDFBlob(false)}
                    disabled={images.length === 0 || processing || !libLoaded}
                    className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                    {processing ? (
                        <>
                            <RefreshCw className="animate-spin" size={20}/> Processing...
                        </>
                    ) : (
                        <>
                            {images.length > 1 ? <><FileDown size={20} /> Merge & Download PDF</> : <><FileDown size={20} /> Download PDF</>}
                        </>
                    )}
                </button>
                
                {!libLoaded && (
                    <p className="text-xs text-amber-500 text-center mt-2">Loading core libraries...</p>
                )}
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-800 leading-relaxed border border-blue-100">
                <strong>Pro Tip:</strong> Agar aapko specific size (jaise 200KB) chahiye, toh upar box mein 200 likhein aur "Auto Fit" dabayein. Tool khud best quality set karega.
            </div>

            <div className="hidden lg:flex justify-center">
              <SidebarAd />
            </div>

          </div>
        </div>
      </div>
      <div className="md:hidden flex justify-center mt-8">
        <MobileBannerAd />
      </div>
    </div>
    );
  };

  return <PdfToolContent />;
}
