export const wallPreview = (fabric, previewCanvas, canvas) => {
  previewCanvas.loadFromJSON(canvas.toDatalessJSON(), () => {
    const objects = previewCanvas.getObjects();
    previewCanvas.discardActiveObject();
    previewCanvas.setActiveObject(
      new fabric.ActiveSelection(objects, {
        canvas: previewCanvas,
      })
    );

    const selectedObjects = previewCanvas.getActiveObject();
    if (selectedObjects) {
      selectedObjects.set('top', selectedObjects.top + 20);
      selectedObjects.set('left', selectedObjects.left + 20);
      selectedObjects.set('shadow', {
        offsetX: 20,
        offsetY: 20,
        blur: 25,
      });
      previewCanvas.renderAll();
    }
    previewCanvas.discardActiveObject();
  });

  const backgroundImageUrl = '../static/wall.png';
  fabric.Image.fromURL(backgroundImageUrl, (backgroundImage) => {
    previewCanvas.setBackgroundImage(backgroundImage, previewCanvas.renderAll.bind(previewCanvas));
  });

  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  previewCanvas.setWidth(canvasWidth);
  previewCanvas.setHeight(canvasHeight);

  previewCanvas.requestRenderAll();
};
