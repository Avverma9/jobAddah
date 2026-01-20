import { useRef, useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "./imageUploader";
import { Slider } from "./slider";
import { Calendar, Download, Save } from "lucide-react";
import { drawDateOverlay } from "./helpers";

export const ResizerTool = ({ sharedImage, setSharedImage }) => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(sharedImage ?? null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [lockRatio, setLockRatio] = useState(true);
  const [transform, setTransform] = useState({ scale: 1, panX: 0, panY: 0 });
  const [dateSettings, setDateSettings] = useState({
    show: false,
    text: "",
    style: "slate",
    bgSlate: "#222222",
  });

  const process = useCallback((img) => {
    setImage(img);
    setDims({ w: img.width, h: img.height });
    setTransform({ scale: 1, panX: 0, panY: 0 });
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
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
    if (!canvasRef.current) return;
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
          <ImageUploader label="Upload Image" image={image} onUpload={handleUpload} onRemove={() => setImage(null)} />
          {image && (
            <div className="bg-slate-50 p-4 rounded-xl space-y-4 border">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-700">New Dimensions</h3>
                <label className="text-xs flex items-center gap-1">
                  <input type="checkbox" checked={lockRatio} onChange={(e) => setLockRatio(e.target.checked)} /> Lock Ratio
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500">WIDTH</label>
                  <input type="number" value={dims.w} onChange={(e) => updateDim("w", Number(e.target.value))} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">HEIGHT</label>
                  <input type="number" value={dims.h} onChange={(e) => updateDim("h", Number(e.target.value))} className="w-full p-2 border rounded" />
                </div>
              </div>

              <div className="border-t pt-3 mt-2">
                <h4 className="text-xs font-bold text-gray-500 mb-2">ADJUST POSITION</h4>
                <Slider label="Scale" value={transform.scale} min={0.1} max={3} onChange={(v) => setTransform({ ...transform, scale: v })} />
                <div className="grid grid-cols-2 gap-2">
                  <Slider label="Pan X" value={transform.panX} min={-500} max={500} onChange={(v) => setTransform({ ...transform, panX: v })} />
                  <Slider label="Pan Y" value={transform.panY} min={-500} max={500} onChange={(v) => setTransform({ ...transform, panY: v })} />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-600 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Calendar size={12} /> NAME / DOB
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={dateSettings.show} onChange={(e) => setDateSettings({ ...dateSettings, show: e.target.checked })} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {dateSettings.show && (
                  <div className="space-y-2 bg-white dark:bg-slate-800 p-2 rounded border border-gray-100 dark:border-slate-700">
                    <input type="text" placeholder="Rahul 20/05/1998" className="w-full text-sm border p-1.5 rounded" value={dateSettings.text} onChange={(e) => setDateSettings({ ...dateSettings, text: e.target.value })} />
                    <div className="flex gap-2 text-xs">
                      <button onClick={() => setDateSettings({ ...dateSettings, style: "slate" })} className={`flex-1 py-1 px-2 rounded border flex items-center justify-center gap-1 ${dateSettings.style === "slate" ? "ring-2 ring-blue-500 border-transparent bg-blue-50" : "border-gray-300"}`}>
                        <div className="w-3 h-3 bg-black border border-gray-500 rounded-sm"></div> Slate
                      </button>
                      <button onClick={() => setDateSettings({ ...dateSettings, style: "white" })} className={`flex-1 py-1 px-2 rounded border flex items-center justify-center gap-1 ${dateSettings.style === "white" ? "ring-2 ring-blue-500 border-transparent bg-blue-50" : "border-gray-300"}`}>
                        <div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div> White
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button type="button" onClick={download} className="w-full">
                  <Download size={16} /> Download Resized
                </Button>
                <Button type="button" onClick={saveToWorkspace} className="w-full bg-blue-700 hover:bg-blue-800">
                  <Save size={14} /> Save Changes to App
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="w-full md:w-2/3 bg-gray-200 rounded-xl flex items-center justify-center p-4 min-h-100">
          <canvas ref={canvasRef} className={`max-w-full max-h-125 shadow-lg ${!image ? "hidden" : ""}`} />
          {!image && <span className="text-gray-400">Preview</span>}
        </div>
      </div>
    </Card>
  );
};
