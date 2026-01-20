import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "./imageUploader";
import { Slider } from "./slider";
import { Download, Save } from "lucide-react";

export const JoinerTool = ({ sharedImage, setSharedImage }) => {
  const canvasRef = useRef(null);
  const [images, setImages] = useState({
    img1: sharedImage ?? null,
    img2: null,
  });
  const [direction, setDirection] = useState("horizontal");
  const [gap, setGap] = useState(0);

  const handleUpload = (e, key) => {
    const file = e.target.files?.[0];
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
          <ImageUploader label="Image 1 (Left/Top)" image={images.img1} onUpload={(e) => handleUpload(e, "img1")} onRemove={() => setImages((p) => ({ ...p, img1: null }))} />
          <ImageUploader label="Image 2 (Right/Bottom)" image={images.img2} onUpload={(e) => handleUpload(e, "img2")} onRemove={() => setImages((p) => ({ ...p, img2: null }))} />
          <div className="flex gap-2 bg-slate-50 p-2 rounded">
            <Button type="button" variant={direction === "horizontal" ? "primary" : "secondary"} onClick={() => setDirection("horizontal")} className="flex-1 text-xs">Side by Side</Button>
            <Button type="button" variant={direction === "vertical" ? "primary" : "secondary"} onClick={() => setDirection("vertical")} className="flex-1 text-xs">Top & Bottom</Button>
          </div>
          <Slider label="Gap" value={gap} min={0} max={100} onChange={setGap} />
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={() => {
                if (!canvasRef.current) return;
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
            <Button type="button" onClick={saveToWorkspace} className="w-full bg-blue-700 hover:bg-blue-800" disabled={!images.img1 && !images.img2}>
              <Save size={14} /> Save Changes to App
            </Button>
          </div>
        </div>
        <div className="md:col-span-2 bg-gray-200 rounded-xl flex items-center justify-center p-4 min-h-100">
          <canvas ref={canvasRef} className={`max-w-full max-h-125 shadow-lg ${!images.img1 && !images.img2 ? "hidden" : ""}`} />
          {!images.img1 && !images.img2 && <span className="text-gray-400">Preview</span>}
        </div>
      </div>
    </Card>
  );
};
