import iro from "@jaames/iro";
import { querySelect, querySelectAll } from "./editor_page.script";

export function iroColorPicker(id, display, color, width = 210, marginTop = 20) {
  const options = {
    display,
    width,
    marginTop,
    transparency: false,
    color,
    layout: [
      {
        component: iro.ui.Box,
      },
      {
        component: iro.ui.Slider,
        options: {
          sliderType: 'hue',
        },
      },
      {
        component: iro.ui.Slider,
        options: {
          sliderType: 'alpha',
        },
      },
    ],
  }
  return iro.ColorPicker(id, options);
}

export function iroColorChange(color, colorChanging, pickerDefaultColor, canvas) {
  colorChanging = true;
  pickerDefaultColor = color.rgbaString;

  if (color.index === 0) {
    const hsl = color.hsl;
    const rgb = color.rgb;
    querySelect('#H').value = hsl.h;
    querySelect('#S').value = hsl.s;
    querySelect('#L').value = hsl.l;
    querySelect('#R').value = rgb.r;
    querySelect('#G').value = rgb.g;
    querySelect('#B').value = rgb.b;
    querySelect('#HEX').value = color.hexString;
  }

  const active = canvas.getActiveObject();
  if (!active) return null
  active.set('fill', color.rgbaString);

  const logoColorPickers = querySelectAll('#color-layers-pickers');
  logoColorPickers.forEach((i) => i.remove());
  colorChanging = false;
}
