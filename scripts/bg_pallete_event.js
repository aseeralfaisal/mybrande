export function bgPalleteEvent(e, canvas) {
  const { colorMode, grad1Value, grad2Value, colorAngle, solidValue } = e.detail;

  let angleColor = `${colorAngle}deg`;
  let color = null;
  if (colorMode === 'Linear') {
    color = new fabric.Gradient({
      type: 'linear',
      coords: {
        x1: 0,
        y1: 0,
        x2: canvas.width,
        y2: canvas.height,
        angle: colorAngle,
      },
      colorStops: [
        { offset: 0, color: grad1Value },
        { offset: 1, color: grad2Value },
      ],
    });
  } else if (colorMode === 'None') {
    setCanvasBackground();
    canvas.setBackgroundColor('#eeeeee', this.canvas.renderAll.bind(this.canvas));
    canvas.requestRenderAll();
  } else {
    color = solidValue;
  }

  canvas.backgroundColor = color;
  querySelect(
    '.color-palette-gradient'
  ).style.background = `linear-gradient(${angleColor}, ${grad1Value}, ${grad2Value})`;
  updatePreview();

  const rect = new fabric.Rect({
    left: 150,
    top: 100,
    fill: color,
    width: 150,
    height: 250,
  });

  canvas.add(rect);
  rect.center();
  canvas.remove(rect);

  canvas.requestRenderAll();
  setTimeout(() => {
    updatePreview();
  }, 100);
}
