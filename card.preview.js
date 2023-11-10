export const renderSVGForCard = (
  fabric,
  logoNameElement,
  sloganNameElement,
  previewCanvas,
  svgFile,
  rotate,
  top
) => {
  fabric.loadSVGFromString(svgFile, (objects, options) => {
    const layerGroup = fabric.util.groupSVGElements(objects, options);

    objects.forEach((obj) => {
      previewCanvas.add(obj);

      const originalWidth = layerGroup.width;
      const originalHeight = layerGroup.height;
      const scaleFactor = Math.min(100 / originalWidth, 100 / originalHeight);
      layerGroup.scale(scaleFactor);
      previewCanvas.centerObject(layerGroup);

      layerGroup.set('top', layerGroup.top += 100);
      layerGroup.set('left', layerGroup.left - 50);
      previewCanvas.requestRenderAll();
    });

    layerGroup.rotate(rotate);

    layerGroup.clone((cloned) => {
      cloned.rotate(-12);
      const originalWidth = layerGroup.width;
      const originalHeight = layerGroup.height;
      const scaleFactor = Math.min(100 / originalWidth, 100 / originalHeight);
      layerGroup.scale(scaleFactor);
      cloned.set('top', cloned.top - 220);
      cloned.set('left', cloned.left + 240);
      previewCanvas.add(cloned);
    });

    logoNameElement.clone((cloned) => {
      previewCanvas.add(cloned);
      cloned.scale(0.7);
      cloned.set('top', cloned.top + 160);
      cloned.set('left', cloned.left - 20);
      cloned.rotate(25);
    });

    sloganNameElement.clone((cloned) => {
      previewCanvas.add(cloned);
      cloned.scale(0.7);
      cloned.set('top', cloned.top + 140);
      cloned.set('left', cloned.left - 35);
      cloned.rotate(25);
    });

    layerGroup.set('left', layerGroup.left + 70);
    layerGroup.set('top', layerGroup.top + top);
  });
  previewCanvas.requestRenderAll();
};
