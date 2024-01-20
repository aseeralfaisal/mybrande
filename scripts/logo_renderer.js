import { CreateLayerSection } from "./create_layer";

export function logoRenderer(canvas, logoFile, logoNameElement, sloganNameElement,
  logoLayerGroup, layers, initRotate, activeNavbarSetting, updateActiveNavbar,
  logoSettingsContainer, textSettingsContainer, backgroundSettingsContainer, isFlipX, isFlipY) {

  fabric.loadSVGFromString(logoFile, (objects, options) => {
    logoLayerGroup = new fabric.Group(objects, options);

    canvas.on('selection:created', () => {
      const selectedObjects = canvas.getActiveObjects();
      selectedObjects.forEach(() => {
        activeNavbarSetting = 'logo';
        updateActiveNavbar();
        logoSettingsContainer.style.display = 'grid';
        textSettingsContainer.style.display = 'none';
        backgroundSettingsContainer.style.display = 'none';
      });
    });

    objects.forEach((obj, idx) => {
      const sloganIdx = objects.length - 1;
      const logoIdx = objects.length - 2;
      if (sloganIdx === idx) {
        obj.scale(800)
        sloganNameElement = obj;
      } else if (logoIdx === idx) {
        obj.scale(800)
        logoNameElement = obj;
      }
      canvas.requestRenderAll();

      canvas.add(obj);
      const layerSection = new CreateLayerSection(layers);
      layerSection.create(obj, idx);

      obj.on('mousedown', (e) => {
        isFlipY = obj.get('flipY');
        isFlipX = obj.get('flipX');
        querySelect('#flip-y').checked = isFlipY;
        querySelect('#flip-x').checked = isFlipX;

        const hasShadow = !!obj?.shadow?.blur;
        querySelect('#logo-drop-shadow').checked = hasShadow;
        isLogoShadowAdjust = hasShadow;
        if (!hasShadow) {
          querySelect('#logo-shadow-adjust').style.display = 'none';
          querySelect('#logo-shadow-blur').style.display = 'none';
          querySelect('#logo-shadow-offsetX').style.display = 'none';
          querySelect('#logo-shadow-offsetY').style.display = 'none';
          querySelect('#logo-shadow-border').style.display = 'none';
        } else {
          querySelect('#logo-shadow-adjust').style.display = 'block';
          querySelect('#logo-shadow-blur').style.display = 'block';
          querySelect('#logo-shadow-offsetX').style.display = 'block';
          querySelect('#logo-shadow-offsetY').style.display = 'block';
          querySelect('#logo-shadow-border').style.display = 'block';
        }

        querySelect('#rotate_info').innerText = `Rotate: ${parseInt(obj.get('angle'))}deg`;
        querySelect('#rotate-bar').value = obj.get('angle');

        const rotateAngle = obj.get('angle');
        querySelect('#rotate-bar').value = rotateAngle;

        const scale = obj.getTotalObjectScaling().scaleX;
        querySelect('#progress-bar').value = scale * 10;
        querySelect('#scale-value').innerText = ` ${scale.toFixed(2)}`;

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

        activeNavbarSetting = 'logo';
        updateActiveNavbar();
        logoSettingsContainer.style.display = 'grid';
        textSettingsContainer.style.display = 'none';
        backgroundSettingsContainer.style.display = 'none';
        canvas.requestRenderAll();
      });
    });

    var originalWidth = logoLayerGroup.width;
    var originalHeight = logoLayerGroup.height;

    const fixedWidth = 200;
    const fixedHeight = 200;

    const widthScaleFactor = fixedWidth / originalWidth;
    const heightScaleFactor = fixedHeight / originalHeight;

    logoLayerGroup.set({
      scaleX: widthScaleFactor,
      scaleY: heightScaleFactor,
      width: fixedWidth,
      height: fixedHeight,
    });

    logoLayerGroup.setCoords();
    canvas.viewportCenterObject(logoLayerGroup);
    initRotate = {
      centerPoint: logoLayerGroup.getCenterPoint(),
      coords: logoLayerGroup.getCoords(),
    };

    logoLayerGroup.scaleToWidth(widthScaleFactor)

    logoLayerGroup.ungroupOnCanvas();
    canvas.renderAll();
  });

  // canvas.add(logoNameElement);
  // canvas.add(sloganNameElement);
  logoNameElement.viewportCenter();
  sloganNameElement.viewportCenter();

  const selection = new fabric.ActiveSelection(canvas.getObjects(), {
    canvas: canvas,
  });
  canvas.setActiveObject(selection);
  canvas.discardActiveObject(selection);
  canvas.requestRenderAll();

}
