export function logoPalleteEvent(e, canvas) {
  const selectedObject = canvas.getActiveObject();
  const { colorMode, grad1Value, grad2Value, solidValue, colorAngle } = e.detail;

  let angleColor = `${colorAngle}deg`;
  let color = null;
  if (colorMode !== 'Solid') {
    color = new fabric.Gradient({
      type: 'linear',
      coords: {
        x1: 0,
        y1: 0,
        x2: selectedObject.width,
        y2: selectedObject.height,
      },
      colorStops: [
        { offset: 0, color: grad1Value },
        { offset: 1, color: grad2Value },
      ],
    });
  } else {
    color = solidValue;
  }

  selectedObject.set('fill', color);
  canvas.requestRenderAll();
  setTimeout(() => {
    updatePreview();
  }, 100);
}
