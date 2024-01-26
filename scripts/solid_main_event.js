import { convertRGBtoHex } from "./color_converter";
import { querySelectAll } from "./editor_page.script";

export function solidColorMainEvent(item, mode, picker, canvas, updateColorPickers, updatePreview, captureCanvasState) {
  return item.addEventListener('click', (event) => {
    if (!canvas) return
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return
    const bgColor = event.target.style.backgroundColor;
    const match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(bgColor);
    if (!match) return
    const red = parseInt(match[1]);
    const green = parseInt(match[2]);
    const blue = parseInt(match[3]);
    const hexColor = convertRGBtoHex(red, green, blue);
    if (mode !== 'bg') {
      activeObj.set('fill', hexColor);
      picker.color.set(hexColor);
    } else if (mode === 'bg') {
      canvas.setBackgroundColor(hexColor);
      const logoColorPickers = querySelectAll('#color-layers-pickers');
      logoColorPickers.forEach((i) => i.remove());
      updateColorPickers();
    }

    if (mode === 'solid') {
      const logoColorPickers = querySelectAll('#color-layers-pickers');
      logoColorPickers.forEach((i) => i.remove());
      updateColorPickers();
    }

    canvas.renderAll();
    updatePreview();
    captureCanvasState();
  });
}


