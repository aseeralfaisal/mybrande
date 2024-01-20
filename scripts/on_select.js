const changePickerColors = (element) => {
  const color = Array.isArray(element.get('fill').colorStops)
    ? rgbToHex(element.get('fill').colorStops[0].color)
    : element.get('fill');
  colorPicker.color.set(color);
  captureCanvasState();
};

const updatePickerHandler = (element) => {
  return () => changePickerColors(element);
};

export function onSelect(canvas, activeLayerIndex) {
  const activeObject = canvas.getActiveObject();
  activeLayerIndex = canvas.getObjects().indexOf(activeObject);

  !activeObject?.text && activeObject?.on('mousedown', updatePickerHandler(activeObject));

  if (activeObject) {
    const layers = querySelectAll('.layer-container');
    layers.forEach((layer, idx) => {
      const layerImg = layer.querySelector('.layer-img');
      const layerSpan = layer.querySelector('.layer-span');

      let fillColor;
      const color = activeObject.get('fill');

      if (typeof color === 'object') {
        fillColor = color.colorStops[0].color;
      } else if (color && color.includes('#')) {
        fillColor = color;
      } else {
        const newColor = rgbaToHex(color);
        fillColor = newColor;
      }

      colorPicker.color.set(fillColor);
      querySelect('#HEX').value = fillColor;

      let rgbValue = hexToRgb(fillColor);
      let rgbValues = rgbValue.match(/\d+/g);

      if (rgbValues && rgbValues.length === 3) {
        querySelect('#R').value = rgbValues[0];
        querySelect('#G').value = rgbValues[1];
        querySelect('#B').value = rgbValues[2];
      }

      let hslValue = hexToHsl(fillColor);
      let hslValues = hslValue.match(/\d+/g);

      if (hslValues && hslValues.length === 3) {
        querySelect('#H').value = hslValues[0];
        querySelect('#S').value = hslValues[1];
        querySelect('#L').value = hslValues[2];
      }

      if (idx == activeLayerIndex) {
        layerSpan.scrollIntoView({ block: 'center', behavior: 'smooth' });
        layerImg.classList.add('selected');
        layerSpan.classList.add('selected');
      } else {
        layerImg.classList.remove('selected');
        layerSpan.classList.remove('selected');
      }
    });
  }
  canvas.requestRenderAll();
};


