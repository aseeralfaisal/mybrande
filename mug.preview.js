export const renderSVGForMug = (fabric, previewCanvas, canvas) => {
  previewCanvas.clear();
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
      selectedObjects.set('top', selectedObjects.top + 130);
      selectedObjects.set('left', selectedObjects.left + 20);
      selectedObjects.set('shadow', {
        offsetX: 20,
        offsetY: 20,
        blur: 25,
      });
    }
    previewCanvas.discardActiveObject();
  });

  const backgroundImageUrl = '/static/mug.png';
  fabric.Image.fromURL(backgroundImageUrl, (backgroundImage) => {
    previewCanvas.setBackgroundImage(backgroundImage, previewCanvas.renderAll.bind(previewCanvas));
  });

  previewCanvas.requestRenderAll();
};
