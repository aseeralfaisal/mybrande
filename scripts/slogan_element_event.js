import { getTextCase, putAngleDownIcon } from "./miscellaneous";

export function sloganELementEvent(isShadowAdjust, sloganNameElement) {
  const hasShadow = !!sloganNameElement?.shadow?.blur;

  querySelect('#drop-shadow').checked = hasShadow;
  isShadowAdjust = hasShadow;
  if (!hasShadow) {
    querySelect('#shadow-adjust').style.display = 'none';
    querySelect('#shadow-blur').style.display = 'none';
    querySelect('#shadow-offsetX').style.display = 'none';
    querySelect('#shadow-offsetY').style.display = 'none';
  } else {
    querySelect('#shadow-adjust').style.display = 'block';
    querySelect('#shadow-blur').style.display = 'block';
    querySelect('#shadow-offsetX').style.display = 'block';
    querySelect('#shadow-offsetY').style.display = 'block';
  }

  const charSpacing = sloganNameElement.get('charSpacing');
  querySelect('#l_spacing_value').innerText = ': ' + charSpacing / 10;

  let fillColor;
  const color = e.target.fill;

  if (typeof color === 'object') {
    fillColor = color.colorStops[0].color;
  } else if (color && color.includes('#')) {
    fillColor = color;
  } else {
    const newColor = rgbaToHex(color);
    fillColor = newColor;
  }

  colorPickerText.color.set(fillColor);
  querySelect('#HEX2').value = fillColor;

  let rgbValue = hexToRgb(fillColor);
  let rgbValues = rgbValue.match(/\d+/g);

  if (rgbValues && rgbValues.length === 3) {
    querySelect('#R2').value = rgbValues[0];
    querySelect('#G2').value = rgbValues[1];
    querySelect('#B2').value = rgbValues[2];
  }

  let hslValue = hexToHsl(fillColor);
  let hslValues = hslValue.match(/\d+/g);

  if (hslValues && hslValues.length === 3) {
    querySelect('#H2').value = hslValues[0];
    querySelect('#S2').value = hslValues[1];
    querySelect('#L2').value = hslValues[2];
  }

  querySelect('.font_style-list-item__title').innerText = sloganNameElement.fontStyle;
  putAngleDownIcon('.font_style-list-item__title');

  const letterSpacing = +sloganNameElement.charSpacing;
  querySelect('#letter-spacing-slider').value = letterSpacing;

  const fontFamily = sloganNameElement.get('fontFamily');
  querySelect('#font-selector-title').innerText = fontFamily;
  putAngleDownIcon('#font-selector-title');

  const fontSize = sloganNameElement.fontSize;
  querySelect('#font_size_title').value = `${fontSize}px`;
  querySelect('#font_size_range').value = fontSize;

  const logoText = sloganNameElement.text;
  querySelect('.case-list-item__title').innerText = getTextCase(logoText);
  putAngleDownIcon('.case-list-item__title');

  if (sloganNameElement.shadow) {
    const { blur, offsetX, offsetY } = sloganNameElement.shadow;

    if (blur && offsetX && offsetY) {
      querySelect('#shadow_blur_title').innerText = ` :${blur}px`;
      querySelect('#shadow-blur-slider').value = blur;
      querySelect('#offset_x_title').innerText = ` :${offsetX}px`;
      querySelect('#shadow-offsetX-slider').value = offsetX;
      querySelect('#offset_y_title').innerText = ` :${offsetY}px`;
      querySelect('#shadow-offsetY-slider').value = offsetY;
    }
  }
}
