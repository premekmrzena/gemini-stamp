import { Template, PhotoState, TextState } from '@/lib/editorConfig';

export async function generateCanvasDataUrl(
  template: Template,
  photos: Record<string, PhotoState>,
  text: TextState,
  includeBackground: boolean = true,
  targetWidth?: number
): Promise<string> {
  const tCanvas = document.createElement('canvas');
  tCanvas.width = template.width;
  tCanvas.height = template.height;
  const ctx = tCanvas.getContext('2d');
  if (!ctx) return '';

  if (includeBackground) {
    const bgImg = new window.Image();
    bgImg.src = template.backgroundImage;
    await new Promise<void>((r) => { bgImg.onload = () => r(); });
    ctx.drawImage(bgImg, 0, 0, tCanvas.width, tCanvas.height);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, tCanvas.width, tCanvas.height);
  }

  for (const slot of template.slots) {
    const photo = photos[slot.id];
    if (!photo) continue;
    const userImg = new window.Image();
    userImg.src = photo.url;
    await new Promise<void>((r) => { userImg.onload = () => r(); });
    ctx.save();
    ctx.beginPath();
    ctx.rect(slot.x, slot.y, slot.width, slot.height);
    ctx.clip();
    const s = Math.min(slot.width / userImg.width, slot.height / userImg.height) * photo.scale;
    ctx.drawImage(
      userImg,
      slot.x + (slot.width - userImg.width * s) / 2 + photo.x,
      slot.y + (slot.height - userImg.height * s) / 2 + photo.y,
      userImg.width * s,
      userImg.height * s
    );
    ctx.restore();
  }

  const textSlot = template.slots.find((s) => s.type === 'text');
  if (textSlot && text.mainText) {
    await document.fonts.load(`600 ${text.fontSize}px ${text.fontFamily}`);
    ctx.save();
    if (text.useShadow) {
      ctx.shadowColor = text.shadowColor;
      ctx.shadowBlur = text.shadowBlur;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
    }
    ctx.fillStyle = text.textColor;
    ctx.font = `600 ${text.fontSize}px ${text.fontFamily}, sans-serif`;
    ctx.textBaseline = 'middle';
    const lines = text.mainText.split('\n');
    const lineHeight = text.fontSize * 1.2;
    const anchorX = textSlot.x + (text.textPos.x / 100) * textSlot.width;
    const anchorY = textSlot.y + (text.textPos.y / 100) * textSlot.height;
    const blockOffset = ((lines.length - 1) * lineHeight) / 2;
    if (text.textAlign === 'center') {
      ctx.textAlign = 'center';
      lines.forEach((line, i) => {
        ctx.fillText(line, anchorX, anchorY - blockOffset + i * lineHeight);
      });
    } else {
      // DOM uses translate(-50%,-50%) so anchorX is always the center of the bounding box.
      // Canvas textAlign shifts the draw origin, so we compensate using the widest line.
      const maxLineWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
      if (text.textAlign === 'left') {
        ctx.textAlign = 'left';
        lines.forEach((line, i) => {
          ctx.fillText(line, anchorX - maxLineWidth / 2, anchorY - blockOffset + i * lineHeight);
        });
      } else {
        ctx.textAlign = 'right';
        lines.forEach((line, i) => {
          ctx.fillText(line, anchorX + maxLineWidth / 2, anchorY - blockOffset + i * lineHeight);
        });
      }
    }
    ctx.restore();
  }

  if (targetWidth && targetWidth < tCanvas.width) {
    const scale = targetWidth / tCanvas.width;
    const resCanvas = document.createElement('canvas');
    resCanvas.width = targetWidth;
    resCanvas.height = tCanvas.height * scale;
    const resCtx = resCanvas.getContext('2d');
    if (resCtx) {
      resCtx.drawImage(tCanvas, 0, 0, resCanvas.width, resCanvas.height);
      return resCanvas.toDataURL('image/jpeg', 0.85);
    }
  }
  return tCanvas.toDataURL('image/jpeg', 0.95);
}

export async function uploadBase64ToBlob(base64Data: string, filename: string, folder: string) {
  const res = await fetch(base64Data);
  const blob = await res.blob();
  const response = await fetch(`/api/upload-stamp?filename=${encodeURIComponent(filename)}&folder=${encodeURIComponent(folder)}`, {
    method: 'POST',
    body: blob,
  });
  if (!response.ok) throw new Error('Upload failed');
  return response.json() as Promise<{ url: string }>;
}
