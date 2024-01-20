import { centerAndResizeElements } from "./center_resize";

export function scaleLogo(scaleSize, canvas) {
  if (!canvas) return null;

  const selection = new fabric.ActiveSelection(canvas.getObjects().filter((i) => !i.text), { canvas });

  const { width, height } = selection;
  const scaleFactor = Math.min(scaleSize / width, scaleSize / height);
  selection.scale(scaleFactor);

  selection.center();
  canvas.setActiveObject(selection);
  canvas.discardActiveObject(selection);
  canvas.requestRenderAll();
};

export function setlogoPosition(position, canvas, logoNameElement, sloganNameElement) {
  switch (position) {
    case "1":
      centerAndResizeElements('topBottom', 46, 22, 'center', 1.32, 1.5, false, canvas, logoNameElement, sloganNameElement);
      break;
    case "2":
      centerAndResizeElements('topBottom', 40, 20, 'center', 1.35, 1.52, false, canvas, logoNameElement, sloganNameElement);
      break;
    case "3":
      centerAndResizeElements('topBottom', 46, 22, 'center', 1.42, 1.6, false, canvas, logoNameElement, sloganNameElement);
      break;
    case "4":
      centerAndResizeElements('bottomTop', 46, 22, 'center', 3.8, 5.5, false, canvas, logoNameElement, sloganNameElement);
      break;
    case "5":
      centerAndResizeElements('bottomTop', 40, 18, 'center', 3.5, 5, false, canvas, logoNameElement, sloganNameElement);
      break;
    case "6":
      centerAndResizeElements('bottomTop', 46, 22, 'center', 3.3, 4.5, false, canvas, logoNameElement, sloganNameElement);
      break;
    case "7":
      centerAndResizeElements('leftRight', 32, 25, 'center', 1.32, 1.5, false, canvas, logoNameElement, sloganNameElement);
      break;
    case "8":
      centerAndResizeElements('leftRight', 32, 25, 'left', 1.32, 1.5, false, canvas, logoNameElement, sloganNameElement);
      break;
    case "9":
      centerAndResizeElements('leftRight', 32, 25, 'left', 1.32, 1.5, false, canvas, logoNameElement, sloganNameElement);
      break;
    case "10":
      centerAndResizeElements('rightLeft', 32, 25, 'center', 1.32, 1.5, false, canvas, logoNameElement, sloganNameElement);
      break;
    case "11":
      centerAndResizeElements('rightLeft', 32, 25, 'center', 1.32, 1.5, false, canvas, logoNameElement, sloganNameElement);
      break;
    case "12":
      centerAndResizeElements('rightLeft', 32, 25, 'center', 1.32, 1.5, false, canvas, logoNameElement, sloganNameElement);
      break;
    case "13":
      centerAndResizeElements('rightLeft', 32, 25, 'center', 1.32, 1.5, false, canvas, logoNameElement, sloganNameElement);
      break;
    case "14":
      centerAndResizeElements('rightLeft', 32, 25, 'center', 1.32, 1.5, false, canvas, logoNameElement, sloganNameElement);
      break;
    case "15":
      centerAndResizeElements('rightLeft', 32, 25, 'center', 1.32, 1.5, false, canvas, logoNameElement, sloganNameElement);
      break;

    default:
      scaleLogo(200);
      centerAndResizeElements('topBottom', 46, 22, 'center', 1.32, 1.5, false, canvas, logoNameElement, sloganNameElement);
      break;
  }
}


