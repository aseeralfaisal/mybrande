import { hexToHsl, hexToRgb } from "./color_converter";
import { querySelect } from "./editor_page.script";

export function generateCustomColor({ e, HEX, R, G, B, H, S, L, wrapper, canvas }) {
  const color = e.target.value;

  const newColor = document.createElement('div');
  newColor.style.backgroundColor = color;
  newColor.className = 'color-picker';
  newColor.style.width = '32px';
  newColor.style.height = '32px';
  newColor.style.borderColor = color;
  newColor.style.borderRadius = '5px';

  newColor.addEventListener('click', () => {
    const activeObj = canvas.getActiveObject();
    activeObj.set('fill', color);
    colorPickerText.color.set(color);
    querySelect(HEX).value = color;

    let rgbValue = hexToRgb(color);
    let rgbValues = rgbValue.match(/\d+/g);

    if (rgbValues && rgbValues.length === 3) {
      querySelect(R).value = rgbValues[0];
      querySelect(G).value = rgbValues[1];
      querySelect(B).value = rgbValues[2];
    }
    let hslValue = hexToHsl(color);
    let hslValues = hslValue.match(/\d+/g);

    if (hslValues && hslValues.length === 3) {
      querySelect(H).value = hslValues[0];
      querySelect(S).value = hslValues[1];
      querySelect(L).value = hslValues[2];
    }
  });
  querySelect(wrapper).append(newColor);
}




