export const shirtPreview = (
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
    objects.forEach((obj, idx) => {
      previewCanvas.add(obj);
      layerGroup.set('top', layerGroup.top + 0);
      previewCanvas.centerObject(layerGroup);
      previewCanvas.requestRenderAll();
    });
    layerGroup.rotate(rotate);

    logoNameElement.clone((cloned) => {
      previewCanvas.add(cloned);
      cloned.set('top', cloned.top + 40);
      cloned.set('left', cloned.left + 10);
    });

    sloganNameElement.clone((cloned) => {
      previewCanvas.add(cloned);
      cloned.set('top', cloned.top + 40);
      cloned.set('left', cloned.left + 10);
    });

    layerGroup.set('left', layerGroup.left + 50);
    layerGroup.set('top', layerGroup.top + top);
  });
  previewCanvas.requestRenderAll();
};
