"use client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BgRemover } from "@/lib/image-tool/bgRemover";
import { ImageUploader } from "@/lib/image-tool/imageUploader";
import { PhotoMakerTool } from "@/lib/image-tool/passport";
import { Slider } from "@/lib/image-tool/slider";
import {
  ArrowRightLeft,
  ArrowUpDown,
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
  Wand2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Internal Hook for Mobile Detection
const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const check = () => setIsMobile(window.innerWidth < breakpoint);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }
  }, [breakpoint]);
  return isMobile;
};

// Placeholder Components for Ads to prevent build errors
const SidebarAd = () => null;
const MobileBannerAd = () => null;
const LeaderboardAd = () => null;

const drawDateOverlay = (ctx, w, h, text, style, bgColor = "#000000") => {
  const stripHeight = h * 0.2;
  const yPos = h - stripHeight;

  if (style === "slate") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, yPos, w, stripHeight);
    ctx.strokeStyle = "#e5e5e5";
    ctx.lineWidth = 2;
    ctx.strokeRect(4, yPos + 4, w - 8, stripHeight - 8);
    ctx.fillStyle = "#ffffff";
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, yPos, w, stripHeight);
    ctx.fillStyle = "#000000";
  }

  ctx.font = `bold ${stripHeight * 0.45}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, yPos + stripHeight / 2);
};

const getClipboardImage = (e, callback) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
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

  useEffect(() => {
    setHydrated(true);
  }, []);
  const [activeTab, setActiveTab] = useState("photo-maker");
  const [sharedImage, setSharedImage] = useState(null);

  const updateSharedImage = (imgOrUrl) => {
    if (typeof imgOrUrl === "string") {
      const img = new Image();
      img.onload = () => setSharedImage(img);
      img.src = imgOrUrl;
    } else {
      setSharedImage(imgOrUrl);
    }
  };

  const renderContent = () => {
    const props = { sharedImage, setSharedImage: updateSharedImage };
    switch (activeTab) {
      case "photo-maker":
        return <PhotoMakerTool {...props} />;
      case "bg-remover":
        return <BgRemover {...props} />;
      case "overlay":
        return <OverlayTool {...props} />;
      case "resizer":
        return <ResizerTool {...props} />;
      case "joiner":
        return <JoinerTool {...props} />;
      default:
        return <PhotoMakerTool {...props} />;
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
          .force-light .dark\\:bg-slate-900,
          .force-light .dark\\:bg-slate-800,
          .force-light .dark\\:bg-slate-700,
          .force-light .dark\\:bg-slate-700\\/50,
          .force-light .dark\\:bg-slate-600 {
            background-color: transparent !important;
            background-image: none !important;
          }

          .force-light .dark\\:text-slate-100,
          .force-light .dark\\:text-slate-400,
          .force-light .dark\\:text-gray-300,
          .force-light .dark\\:text-slate-200 {
            color: inherit !important;
          }

          .force-light .dark\\:border-slate-700,
          .force-light .dark\\:border-slate-600 {
            border-color: rgba(0, 0, 0, 0.08) !important;
          }

          .force-light .dark\\:hover\\:bg-slate-700 {
            background-color: #f1f5f9 !important;
          }
        `}</style>

        <div
          className={`min-h-screen bg-gray-50 p-2 md:p-6 font-sans text-slate-900 ${
            hydrated && isMobile ? "pb-24" : ""
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <header className="mb-6 text-center">
              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 dark:text-dark mb-2 tracking-tight">
                Image Master Suite
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Professional tools for everyday tasks
              </p>
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
                    {
                      id: "photo-maker",
                      icon: Layout,
                      label: "Passport Photo",
                    },
                    { id: "bg-remover", icon: Eraser, label: "BG Remover" },
                    { id: "overlay", icon: Layers, label: "Overlay" },
                    { id: "resizer", icon: Maximize2, label: "Resizer" },
                    { id: "joiner", icon: Columns, label: "Joiner" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
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

const OverlayTool = ({ sharedImage, setSharedImage }) => {
  const canvasRef = useRef(null);
  const [baseImage, setBaseImage] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [settings, setSettings] = useState({
    x: 50,
    y: 50,
    scale: 0.5,
    opacity: 1,
  });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (sharedImage && !baseImage) setBaseImage(sharedImage);
  }, [sharedImage]);

  const handleImageLoad = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          if (type === "base") {
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
    const ctx = canvas.getContext("2d");

    ctx.globalAlpha = 1;
    ctx.drawImage(baseImage, 0, 0);

    if (overlayImage) {
      ctx.globalAlpha = settings.opacity;
      const w = overlayImage.width * settings.scale;
      const h = overlayImage.height * settings.scale;
      const x = (canvas.width * settings.x) / 100 - w / 2;
      const y = (canvas.height * settings.y) / 100 - h / 2;
      ctx.drawImage(overlayImage, x, y, w, h);

      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(x, y, w, h);
    }
  }, [baseImage, overlayImage, settings]);

  const handleDrag = (e) => {
    if (!isDragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSettings((prev) => ({ ...prev, x, y }));
  };

  const saveToWorkspace = () => {
    if (canvasRef.current) {
      setSharedImage(canvasRef.current.toDataURL());
    }
  };

  return (
    <Card>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-4 order-2 md:order-1">
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500">1. BACKGROUND</p>
            <ImageUploader
              label="Base Image"
              image={baseImage}
              onUpload={(e) => handleImageLoad(e, "base")}
              onRemove={() => setBaseImage(null)}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500">
              2. OVERLAY (Sticker/Logo)
            </p>
            <ImageUploader
              label="Overlay Image"
              image={overlayImage}
              onUpload={(e) => handleImageLoad(e, "overlay")}
              onRemove={() => setOverlayImage(null)}
            />
          </div>
          {overlayImage && (
            <div className="bg-slate-50 p-3 rounded space-y-2">
              <Slider
                label="Size"
                value={settings.scale}
                min={0.1}
                max={2}
                onChange={(v) => setSettings({ ...settings, scale: v })}
              />
              <Slider
                label="Opacity"
                value={settings.opacity}
                min={0.1}
                max={1}
                onChange={(v) => setSettings({ ...settings, opacity: v })}
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-xs text-gray-500 flex items-center gap-1">
                    <ArrowRightLeft size={10} /> Pos X
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.x}
                    onChange={(e) =>
                      setSettings({ ...settings, x: Number(e.target.value) })
                    }
                    className="w-full h-1.5 bg-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 flex items-center gap-1">
                    <ArrowUpDown size={10} /> Pos Y
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.y}
                    onChange={(e) =>
                      setSettings({ ...settings, y: Number(e.target.value) })
                    }
                    className="w-full h-1.5 bg-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                Drag image on preview to move.
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                const link = document.createElement("a");
                link.download = "overlay-result.png";
                link.href = canvasRef.current.toDataURL();
                link.click();
              }}
              disabled={!baseImage}
              className="w-full"
            >
              <Download size={16} /> Download
            </Button>
            <Button
              onClick={saveToWorkspace}
              className="w-full bg-blue-700 hover:bg-blue-800"
              disabled={!baseImage}
            >
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
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [lockRatio, setLockRatio] = useState(true);
  const [transform, setTransform] = useState({ scale: 1, panX: 0, panY: 0 });
  const [dateSettings, setDateSettings] = useState({
    show: false,
    text: "",
    style: "slate",
    bgSlate: "#222222",
  });

  useEffect(() => {
    if (sharedImage && !image) process(sharedImage);
  }, [sharedImage]);

  const process = (img) => {
    setImage(img);
    setDims({ w: img.width, h: img.height });
    setTransform({ scale: 1, panX: 0, panY: 0 });
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    if (lockRatio && image) {
      const ratio = image.width / image.height;
      if (key === "w") setDims({ w: val, h: Math.round(val / ratio) });
      else setDims({ h: val, w: Math.round(val * ratio) });
    } else {
      setDims((prev) => ({ ...prev, [key]: val }));
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !image) return;
    const canvas = canvasRef.current;
    canvas.width = dims.w;
    canvas.height = dims.h;
    const ctx = canvas.getContext("2d");

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
    const link = document.createElement("a");
    link.download = `resized-${dims.w}x${dims.h}.png`;
    link.href = canvasRef.current.toDataURL("image/png", 0.9);
    link.click();
  };

  const saveToWorkspace = () => {
    if (canvasRef.current) {
      setSharedImage(canvasRef.current.toDataURL());
    }
  };

  return (
    <Card>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-6">
          <ImageUploader
            label="Upload Image"
            image={image}
            onUpload={handleUpload}
            onRemove={() => setImage(null)}
          />
          {image && (
            <div className="bg-slate-50 p-4 rounded-xl space-y-4 border">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-700">New Dimensions</h3>
                <label className="text-xs flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={lockRatio}
                    onChange={(e) => setLockRatio(e.target.checked)}
                  />{" "}
                  Lock Ratio
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500">
                    WIDTH
                  </label>
                  <input
                    type="number"
                    value={dims.w}
                    onChange={(e) => updateDim("w", Number(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">
                    HEIGHT
                  </label>
                  <input
                    type="number"
                    value={dims.h}
                    onChange={(e) => updateDim("h", Number(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="border-t pt-3 mt-2">
                <h4 className="text-xs font-bold text-gray-500 mb-2">
                  ADJUST POSITION
                </h4>
                <Slider
                  label="Scale"
                  value={transform.scale}
                  min={0.1}
                  max={3}
                  onChange={(v) => setTransform({ ...transform, scale: v })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Slider
                    label="Pan X"
                    value={transform.panX}
                    min={-500}
                    max={500}
                    onChange={(v) => setTransform({ ...transform, panX: v })}
                  />
                  <Slider
                    label="Pan Y"
                    value={transform.panY}
                    min={-500}
                    max={500}
                    onChange={(v) => setTransform({ ...transform, panY: v })}
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-600 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Calendar size={12} /> NAME / DOB
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={dateSettings.show}
                      onChange={(e) =>
                        setDateSettings({
                          ...dateSettings,
                          show: e.target.checked,
                        })
                      }
                    />
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
                      onChange={(e) =>
                        setDateSettings({
                          ...dateSettings,
                          text: e.target.value,
                        })
                      }
                    />
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() =>
                          setDateSettings({ ...dateSettings, style: "slate" })
                        }
                        className={`flex-1 py-1 px-2 rounded border flex items-center justify-center gap-1 ${
                          dateSettings.style === "slate"
                            ? "ring-2 ring-blue-500 border-transparent bg-blue-50"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="w-3 h-3 bg-black border border-gray-500 rounded-sm"></div>{" "}
                        Slate
                      </button>
                      <button
                        onClick={() =>
                          setDateSettings({ ...dateSettings, style: "white" })
                        }
                        className={`flex-1 py-1 px-2 rounded border flex items-center justify-center gap-1 ${
                          dateSettings.style === "white"
                            ? "ring-2 ring-blue-500 border-transparent bg-blue-50"
                            : "border-gray-300"
                        }`}
                      >
                        <div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div>{" "}
                        White
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={download} className="w-full">
                  <Download size={16} /> Download Resized
                </Button>
                <Button
                  onClick={saveToWorkspace}
                  className="w-full bg-blue-700 hover:bg-blue-800"
                >
                  <Save size={14} /> Save Changes to App
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="w-full md:w-2/3 bg-gray-200 rounded-xl flex items-center justify-center p-4 min-h-100">
          <canvas
            ref={canvasRef}
            className={`max-w-full max-h-125 shadow-lg ${
              !image ? "hidden" : ""
            }`}
          />
          {!image && <span className="text-gray-400">Preview</span>}
        </div>
      </div>
    </Card>
  );
};

const JoinerTool = ({ sharedImage, setSharedImage }) => {
  const canvasRef = useRef(null);
  const [images, setImages] = useState({ img1: null, img2: null });
  const [direction, setDirection] = useState("horizontal");
  const [gap, setGap] = useState(0);

  useEffect(() => {
    if (sharedImage && !images.img1)
      setImages((prev) => ({ ...prev, img1: sharedImage }));
  }, [sharedImage]);

  const handleUpload = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          setImages((prev) => ({ ...prev, [key]: img }));
          setSharedImage(img);
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || (!images.img1 && !images.img2)) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { img1, img2 } = images;

    const w1 = img1?.width || 0;
    const h1 = img1?.height || 0;
    const w2 = img2?.width || 0;
    const h2 = img2?.height || 0;

    if (direction === "horizontal") {
      canvas.width = w1 + w2 + gap;
      canvas.height = Math.max(h1, h2);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (img1) ctx.drawImage(img1, 0, 0);
      if (img2) ctx.drawImage(img2, w1 + gap, 0);
    } else {
      canvas.width = Math.max(w1, w2);
      canvas.height = h1 + h2 + gap;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (img1) ctx.drawImage(img1, 0, 0);
      if (img2) ctx.drawImage(img2, 0, h1 + gap);
    }
  }, [images, direction, gap]);

  const saveToWorkspace = () => {
    if (canvasRef.current) {
      setSharedImage(canvasRef.current.toDataURL());
    }
  };

  return (
    <Card>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <ImageUploader
            label="Image 1 (Left/Top)"
            image={images.img1}
            onUpload={(e) => handleUpload(e, "img1")}
            onRemove={() => setImages((p) => ({ ...p, img1: null }))}
          />
          <ImageUploader
            label="Image 2 (Right/Bottom)"
            image={images.img2}
            onUpload={(e) => handleUpload(e, "img2")}
            onRemove={() => setImages((p) => ({ ...p, img2: null }))}
          />
          <div className="flex gap-2 bg-slate-50 p-2 rounded">
            <Button
              variant={direction === "horizontal" ? "primary" : "secondary"}
              onClick={() => setDirection("horizontal")}
              className="flex-1 text-xs"
            >
              Side by Side
            </Button>
            <Button
              variant={direction === "vertical" ? "primary" : "secondary"}
              onClick={() => setDirection("vertical")}
              className="flex-1 text-xs"
            >
              Top & Bottom
            </Button>
          </div>
          <Slider label="Gap" value={gap} min={0} max={100} onChange={setGap} />
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                const link = document.createElement("a");
                link.download = "joined.png";
                link.href = canvasRef.current.toDataURL();
                link.click();
              }}
              disabled={!images.img1 && !images.img2}
              className="w-full"
            >
              Download Joined
            </Button>
            <Button
              onClick={saveToWorkspace}
              className="w-full bg-blue-700 hover:bg-blue-800"
              disabled={!images.img1 && !images.img2}
            >
              <Save size={14} /> Save Changes to App
            </Button>
          </div>
        </div>
        <div className="md:col-span-2 bg-gray-200 rounded-xl flex items-center justify-center p-4 min-h-100">
          <canvas
            ref={canvasRef}
            className={`max-w-full max-h-125 shadow-lg ${
              !images.img1 && !images.img2 ? "hidden" : ""
            }`}
          />
          {!images.img1 && !images.img2 && (
            <span className="text-gray-400">Preview</span>
          )}
        </div>
      </div>
    </Card>
  );
};
