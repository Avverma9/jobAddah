export const getClipboardImage = (event, callback) => {
  if (typeof window === "undefined") return;
  if (!event?.clipboardData || typeof callback !== "function") return;

  const { items } = event.clipboardData;
  if (!items?.length) return;

  for (const item of items) {
    if (!item.type?.startsWith("image")) continue;
    const file = item.getAsFile();
    if (!file) continue;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const url = readerEvent?.target?.result;
      if (!url) return;

      const img = new Image();
      img.onload = () => callback(img);
      img.src = url;
    };
    reader.readAsDataURL(file);
    event.preventDefault();
    break;
  }
};

export const drawDateOverlay = (
  ctx,
  width,
  height,
  text,
  style = "slate",
  slateColor = "#1f2937"
) => {
  if (!ctx || !width || !height) return;
  const safeText = text?.trim();
  if (!safeText) return;

  const stripHeight = Math.max(40, Math.round(height * 0.08));
  const yPos = height - stripHeight - Math.round(stripHeight * 0.15);

  ctx.save();
  ctx.globalAlpha = 0.95;

  if (style === "slate") {
    ctx.fillStyle = slateColor;
    ctx.fillRect(0, yPos, width, stripHeight);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(4, yPos + 4, width - 8, stripHeight - 8);
    ctx.fillStyle = "#ffffff";
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, yPos, width, stripHeight);
    ctx.strokeStyle = "rgba(15,23,42,0.08)";
    ctx.strokeRect(0, yPos, width, stripHeight);
    ctx.fillStyle = "#0f172a";
  }

  ctx.font = `600 ${stripHeight * 0.4}px "Inter", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(safeText, width / 2, yPos + stripHeight / 2);

  ctx.restore();
};
