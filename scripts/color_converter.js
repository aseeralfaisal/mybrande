
export const convertRGBtoHex = (red, green, blue) => {
  const redHex = ColorChannelToHex(red);
  const greenHex = ColorChannelToHex(green);
  const blueHex = ColorChannelToHex(blue);
  return `#${redHex}${greenHex}${blueHex}`;
};

export const rgbToHex = (rgbString) => {
  let parts = rgbString.replace('rgb(', '').replace(')', '').split(',');

  let r = parseInt(parts[0], 10);
  let g = parseInt(parts[1], 10);
  let b = parseInt(parts[2], 10);

  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  if (r.length < 2) r = '0' + r;
  if (g.length < 2) g = '0' + g;
  if (b.length < 2) b = '0' + b;

  return '#' + r + g + b;
};

export const hexToRgb = (hexString) => {
  hexString = hexString.replace(/^#/, '');

  let bigint = parseInt(hexString, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  return `rgb(${r}, ${g}, ${b})`;
};

export const hexToHsl = (hexString) => {
  hexString = hexString.replace(/^#/, '');

  let bigint = parseInt(hexString, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  r /= 255;
  g /= 255;
  b /= 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `hsl(${h}, ${s}%, ${l}%)`;
};

export const rgbaToHex = (rgbaString) => {
  const match = rgbaString.toString().match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
  if (!match) return 'HEX';

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  };
  const hex = '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);

  return hex;
};

export const ColorChannelToHex = (channel) => {
  const hex = channel.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};


