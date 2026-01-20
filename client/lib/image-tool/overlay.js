import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "./imageUploader";
import { Slider } from "./slider";
import { ArrowRightLeft, ArrowUpDown, Download, Save } from "lucide-react";

export const OverlayTool = ({ sharedImage, setSharedImage }) => {
  const canvasRef = useRef(null);
  const [baseImage, setBaseImage] = useState(sharedImage ?? null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [settings, setSettings] = useState({
    x: 50,
    y: 50,
    scale: 0.5,
    opacity: 1,
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleImageLoad = (e, type) => {
    const file = e.target.files?.[0];
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
      ctx.setLineDash([]);
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
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={() => {
                if (!canvasRef.current) return;
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
              type="button"
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
