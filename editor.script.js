import { fabric } from 'fabric';
import { CreateLayerSection } from './createLayer';
import clipIcons from './assets/icons/clipIcons';
import { DeleteLayer } from './handleDeleteLayer';
import 'alwan/dist/css/alwan.min.css';
import iro from '@jaames/iro';
import WebFont from 'webfontloader';
import axios from 'axios';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

const toastNotification = (text) => {
  return Toastify({
    text,
    duration: 3000,
    newWindow: true,
    close: false,
    gravity: 'top',
    position: 'center',
    stopOnFocus: true,
    style: {
      background: 'var(--gold)',
      color: '#ffffff',
      borderRadius: '8px',
      cursor: 'context-menu',
    },
    onClick: null,
  }).showToast();
};

const querySelect = (element) => document.querySelector(element);
const querySelectAll = (element) => document.querySelectorAll(element);

WebFont.load({
  google: {
    families: ['Poppins:300,400,500,600,700', 'Inter:300,400,500,600,700', 'Roboto:400,500,700'],
  },
  fontloading: () => (querySelect('#loader').style.display = 'flex'),
  fontactive: (familyName) => {
    if (familyName === 'Poppins' || familyName === 'Inter' || familyName === 'Roboto') {
      querySelect('#loader').style.display = 'none';
    }
  },
});

const ColorChannelToHex = (channel) => {
  const hex = channel.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

const convertRGBtoHex = (red, green, blue) => {
  const redHex = ColorChannelToHex(red);
  const greenHex = ColorChannelToHex(green);
  const blueHex = ColorChannelToHex(blue);
  return `#${redHex}${greenHex}${blueHex}`;
};

const rgbToHex = (rgbString) => {
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

const hexToRgb = (hexString) => {
  hexString = hexString.replace(/^#/, '');

  let bigint = parseInt(hexString, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  return `rgb(${r}, ${g}, ${b})`;
};

const hexToHsl = (hexString) => {
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

const rgbaToHex = (rgbaString) => {
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

class EditorScreen {
  constructor() {
    this.canvasBG = '#efefef';
    this.canvas = new fabric.Canvas('c', { backgroundColor: this.canvasBG });
    this.magnifier = new fabric.Canvas('magnifier', { backgroundColor: this.canvasBG });
    this.textMode = querySelect('.nav-item[data-name="text"]');
    this.logoMode = querySelect('.nav-item[data-name="logo"]');
    this.uploadsMode = querySelect('.nav-item[data-name="uploads"]');
    this.backgroundMode = querySelect('.nav-item[data-name="background"]');
    this.previewMode = querySelect('.nav-item[data-name="preview"]');
    this.galleryMode = querySelect('.nav-item[data-name="gallery"]');
    this.urlParams = new URLSearchParams(document.location.search);
    this.logoName = 'My Brand Name';
    this.sloganName = 'Slogan goes here';
    this.rotateRange = querySelect('#rotate-bar');
    this.saveBtn = querySelect('#save-btn');
    this.scaleRange = querySelect('#progress-bar');
    this.scaleRangeUploads = querySelect('#progress-bar-uploads');
    this.scaleElement = querySelect('#scale-value');
    this.flipHorizontal = querySelect('#flip-x');
    this.flipVertical = querySelect('#flip-y');
    this.activeLayerIndex = null;
    this.logoFile = localStorage.getItem('logo-file');
    this.layers = querySelect('#layers');
    this.textLayers = querySelect('#text-layers');
    this.rotateValue = null;
    this.isRotating = false;
    this.scaleValue = 3;
    this.isScaling = null;
    this.isFlipX = false;
    this.isFlipY = false;
    this.textcolorPicker = querySelect('#color-picker');
    this.logoColorPicker = querySelect('#logo-color-picker');
    this.logoColorPicker1 = querySelect('#logo-color-picker1');
    this.logoColorPicker2 = querySelect('#logo-color-picker2');
    this.logoNameInput = querySelect('#logoNameInput');
    this.sloganNameInput = querySelect('#sloganNameInput');
    this.logoSettingsContainer = querySelect('.setting-container');
    this.textSettingsContainer = querySelect('.text-settings-container');
    this.backgroundSettingsContainer = querySelect('.bg-settings-container');
    this.uploadSettingsContainer = querySelect('.uploads-settings-container');
    this.textColorPickerContainer = querySelect('.color-picker-container');
    this.letterSpacingSlider = querySelect('#letter-spacing-slider');
    this.textColorPickerValue = '#eeeeee';
    this.letterSpacing = '0';
    this.textSelector = querySelect('#text-selector');
    this.shadowBlurSlider = querySelect('#shadow-blur-slider');
    this.shadowOffsetXSlider = querySelect('#shadow-offsetX-slider');
    this.shadowOffsetYSlider = querySelect('#shadow-offsetY-slider');
    this.logoShadowOffsetXSlider = querySelect('#logo-shadow-offsetX-slider');
    this.logoShadowOffsetYSlider = querySelect('#logo-shadow-offsetY-slider');
    this.shadowBlur = null;
    this.shadowOffsetX = null;
    this.shadowOffsetY = null;
    this.logoShadowBlur = null;
    this.logoShadowOffsetX = null;
    this.logoShadowOffsetY = null;
    this.textSettingsContainer.style.display = 'none';
    this.canvasZoomLevel = 1;
    this.settingsListTitle = querySelect('.setting-list-item__title');
    this.caseListTitle = querySelect('.case-list-item__title');
    this.fontSizeListTitle = querySelect('.font_size-list-item__title');
    this.fontStyleListTitle = querySelect('.font_style-list-item__title');
    this.settingsList = querySelect('.setting-list-items-li');
    this.fontStyleList = querySelect('.font_style-list-items-li');
    this.fontSizeList = querySelect('.font_size-list-items-li');
    this.caseList = querySelect('.case-list-items-li');
    this.fontSelector = querySelect('.font-selector');
    this.textSelectorValue = 'LogoName';
    this.logoFillColor = null;
    this.zoomSlider = querySelect('#zoom-slider');
    this.colorMode = 'Solid';
    this.activeNavbarSetting = 'logo';
    this.initialRotation = null;
    this.logoOrientation = null;

    this.transparentLoader = (isOn = true) => {
      querySelect('#loader').style.display = isOn ? 'flex' : 'none';
      querySelect('#loader').style.background = '#ffffffbb';
    };

    this.rotateObject = () => {
      const active = this.canvas.getActiveObject();

      if (this.isRotating && active && this.rotateValue) {
        active.rotate(this.rotateValue);
        this.canvas.requestRenderAll();
      }
      this.isRotating = false;
    };

    this.scaleObject = () => {
      const active = this.canvas.getActiveObject();
      const currCoordinate = active?.getCenterPoint();
      if (this.isScaling && active && this.scaleValue) {
        active.scale(this.scaleValue);

        active.setPositionByOrigin(new fabric.Point(currCoordinate.x, currCoordinate.y), 'center', 'center');
        active.setCoords();
        this.canvas.requestRenderAll();
      }
      this.isScaling = false;
    };

    querySelect('#rotate_reset').addEventListener('click', () => {
      const active = this.canvas.getActiveObject();

      if (active) {
        if (active._objects) {
          const groupObjects = active.getObjects();

          groupObjects.forEach((object) => {
            const currCoordinate = object.getCenterPoint();
            object.set('angle', 0);
            object.set('matrix', [1, 0, 0, 1, 0, 0]);
            object.set({
              originX: 'center',
              originY: 'center',
            });
            object.setPositionByOrigin(
              new fabric.Point(currCoordinate.x, currCoordinate.y),
              'center',
              'center'
            );
          });

          const groupCenter = active.getCenterPoint();
          active.setPositionByOrigin(new fabric.Point(groupCenter.x, groupCenter.y), 'center', 'center');
        } else {
          const currCoordinate = active.getCenterPoint();
          active.set('angle', 0);
          active.set('matrix', [1, 0, 0, 1, 0, 0]);
          active.set({
            originX: 'center',
            originY: 'center',
          });
          active.setPositionByOrigin(
            new fabric.Point(currCoordinate.x, currCoordinate.y),
            'center',
            'center'
          );
        }
        this.canvas.renderAll();
      }
    });

    this.shadowChanger = (sloganNameElement, logoNameElement) => {
      const element = this.textSelectorValue === 'SloganName' ? sloganNameElement : logoNameElement;
      element.set('shadow', {
        offsetX: this.shadowOffsetX,
        offsetY: this.shadowOffsetY,
        blur: this.shadowBlur,
      });
    };

    this.canvas.setBackgroundImage('/static/pattern.png', this.canvas.renderAll.bind(this.canvas), {
      opacity: 0.6,
      originX: 'left',
      originY: 'top',
      top: 0,
      left: 0,
      scaleX: 0.3,
      scaleY: 0.3,
    });

    this.canvas.on('after:render', () => {
      querySelect('#loader').style.display = 'none';
    });
  }

  initialize() {
    const updatePreview = () => {
      const imageURL = this.canvas.toDataURL({
        format: 'png',
        multiplier: 0.5,
      });
      querySelect('#magnifier_img').src = imageURL;
    };

    const setCanvasBackground = () => {
      this.canvas.setBackgroundImage('/static/pattern.png', this.canvas.renderAll.bind(this.canvas), {
        opacity: 0.6,
        originX: 'left',
        originY: 'top',
        top: 0,
        left: 0,
        scaleX: 0.3,
        scaleY: 0.3,
      });
    };

    setCanvasBackground();

    updatePreview();

    fabric.Object.prototype.setControlsVisibility({
      mt: false,
      mb: false,
      ml: false,
      mr: false,
      mtr: false,
      bl: true,
      br: true,
      tl: true,
      tr: true,
    });

    this.canvas.requestRenderAll();

    this.updateActiveNavbar = () => {
      querySelectAll('.nav-item').forEach((item) => {
        if (this.activeNavbarSetting.includes(item.innerText.toLowerCase())) {
          item.style.backgroundColor = 'var(--gold-darker)';
        } else {
          item.style.backgroundColor = 'var(--gold)';
        }
      });
    };

    this.updateActiveNavbar();

    this.caseListTitle.addEventListener('click', (e) => {
      if (this.caseList.classList.contains('show')) {
        this.caseList.classList.remove('show');
      } else {
        this.caseList.classList.add('show');
      }

      [fontList, fontStyleList].forEach((i) => i.classList.remove('show'));
    });

    const toTitleCase = (str) => {
      return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    const toSentenceCase = (str) => {
      const stack = [];
      stack.push(str[0].toUpperCase());
      for (let i = 1; i < str.length; i++) {
        stack.push(str[i].toLowerCase());
      }
      return stack.join('');
    };

    this.caseList.addEventListener('click', (event) => {
      const selectedTextElement = event.target.innerText;
      const active = this.canvas.getActiveObject();
      const currCoordinate = active.getCenterPoint();

      const existingFont = active.get('fontFamily');
      const existingFill = active.get('fill');
      const existingSelectable = active.get('selectable');
      const HasRotatingPoint = active.get('hasRotatingPoint');
      const existingDiameter = active.get('diameter');
      const existingLeft = active.get('left');
      const existingTop = active.get('top');
      const existingFlipped = active.get('flipped');
      const existingFontSize = active.get('fontSize');
      active.set('fontSize', 40);

      const text = active?.text;
      if (selectedTextElement === 'Uppercase') {
        active.text = text.toUpperCase();
      } else if (selectedTextElement === 'Lowercase') {
        active.text = text.toLowerCase();
      } else if (selectedTextElement === 'Title Case') {
        active.text = toTitleCase(text);
      } else if (selectedTextElement === 'Sentence Case') {
        active.text = toSentenceCase(text);
      }

      active.set('fontFamily', existingFont);
      active.set('fill', existingFill);
      active.set('selectable', existingSelectable);
      active.set('hasRotatingPoint', HasRotatingPoint);
      active.set('diameter', existingDiameter);
      active.set('left', existingLeft);
      active.set('top', existingTop);
      active.set('flipped', existingFlipped);
      active.set('fontSize', existingFontSize);

      active.setPositionByOrigin(new fabric.Point(currCoordinate.x, currCoordinate.y), 'center', 'center');
      active.setCoords();

      this.canvas.renderAll();

      this.caseListTitle.innerText = selectedTextElement;
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-angle-down';
      this.caseListTitle.append(icon);
      this.caseList.classList.remove('show');
    });

    this.fontStyleList.addEventListener('click', (ev) => {
      const selectedTextElement = ev.target.innerText;

      const active = this.canvas.getActiveObject();
      if (selectedTextElement === 'Normal') {
        active.set('fontStyle', 'normal');
        active.set('underline', false);
      } else if (selectedTextElement === 'Italic') {
        active.set('fontStyle', 'italic');
        active.set('underline', false);
      } else {
        active.set('fontStyle', 'normal');
        active.set('underline', true);
      }

      this.fontStyleListTitle.innerText = selectedTextElement;
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-angle-down';
      this.fontStyleListTitle.append(icon);
      this.fontStyleList.classList.remove('show');
      this.canvas.requestRenderAll();
    });

    this.rotateRange.addEventListener('input', (e) => {
      this.isRotating = true;
      this.rotateValue = parseInt(e.target.value, 10);
      querySelect('#rotate_info').innerText = `Rotate: ${parseInt(this.rotateValue)}deg`;
      this.rotateObject();
    });

    this.rotateRange.addEventListener('change', updatePreview);

    querySelect('#rotate-bar-uploads').addEventListener('input', (e) => {
      this.isRotating = true;
      this.rotateValue = parseInt(e.target.value, 10);
      this.rotateObject();
    });

    this.saveBtn.addEventListener('click', async () => {
      this.transparentLoader(true);

      const bgColor = this.canvas.get('backgroundColor');
      this.canvas.setBackgroundImage(null);
      this.canvas.setBackgroundColor(null, this.canvas.renderAll.bind(this.canvas));
      const currentCanvasSVG = this.canvas.toSVG();

      const currentCanvasData = JSON.stringify(this.canvas);
      const sellerLogoInfoId = localStorage.getItem('sellerLogoInfoId');

      const getFormattedBgColor = (bgColor) => {
        if (typeof bgColor === 'object') {
          const color = bgColor.colorStops.map((i) => i.color);
          return color.join(',');
        }
        return bgColor;
      };

      if (currentCanvasData && sellerLogoInfoId) {
        const postData = {
          seller_logoinfo_id: sellerLogoInfoId,
          json_data: currentCanvasData,
          svg_data: currentCanvasSVG,
          orientation: this.logoOrientation,
          logo_spacing: +logoNameElement.get('charSpacing') / 10,
          slogan_spacing: +sloganNameElement.get('charSpacing') / 10,
          backcolor: bgColor === this.canvasBG ? 'transparent' : getFormattedBgColor(bgColor),
        };
        const response = await axios.post(`https://www.mybrande.com/api/seller/logo/store`, postData);

        this.canvas.setBackgroundColor(bgColor, this.canvas.renderAll.bind(this.canvas));
        setCanvasBackground();

        const { logoSavedCount } = response.data;

        if (response.status === 200) {
          toastNotification(
            `You have saved ${logoSavedCount} ${
              logoSavedCount === 1 ? 'time' : 'times'
            }. Save at least three variants to move on to the next page`
          );
          this.transparentLoader(false);
          if (logoSavedCount >= 3) {
            querySelect('#third_page_btn').style.display = 'flex';
          }
          if (logoSavedCount >= 8) {
            querySelect('#save-btn').style.display = 'none';
          }
        }
      }
    });

    querySelect('#third_page_btn').addEventListener('click', () => {
      const savedLogo = this.canvas.toDataURL({
        format: 'png',
        multiplier: 10,
      });
      localStorage.setItem('saved_logo', savedLogo);
      localStorage.setItem('mainEditorCounter', 3);
      location.reload();

      setTimeout(() => {
        querySelect('#drag_drop_view').style.display = 'none';
        querySelect('#main_editor_view').style.display = 'none';
        querySelect('#details_view').style.display = 'block';
      }, 50);
    });

    this.scaleElement.textContent = 1;
    this.scaleRange.addEventListener('input', (e) => {
      const scaleValue = e.target.value;

      if (scaleValue) {
        if (this.isScaling <= 10) this.isScaling = true;
        this.scaleValue = parseFloat(scaleValue, 10) / 10;
        this.scaleObject();
        this.scaleElement.textContent = this.scaleValue;
      }
    });

    this.scaleRange.addEventListener('change', updatePreview);

    this.flipHorizontal.addEventListener('change', () => {
      const active = this.canvas.getActiveObject();
      const currCoordinate = active.getCenterPoint();

      if (active) {
        this.isFlipX = !this.isFlipX;
        active.set('flipX', this.isFlipX);

        active.setPositionByOrigin(new fabric.Point(currCoordinate.x, currCoordinate.y), 'center', 'center');
        active.setCoords();

        this.canvas.renderAll();
      }

      updatePreview();
    });

    this.flipVertical.addEventListener('change', () => {
      const active = this.canvas.getActiveObject();
      const currCoordinate = active.getCenterPoint();

      if (active) {
        this.isFlipY = !this.isFlipY;
        active.set('flipY', this.isFlipY);

        active.setPositionByOrigin(new fabric.Point(currCoordinate.x, currCoordinate.y), 'center', 'center');
        active.setCoords();

        this.canvas.renderAll();
        updatePreview();
      }
    });

    this.layers.addEventListener('click', (e) => {
      const target = e.target;
      this.activeLayerIndex =
        target.getAttribute('data_layer') || target.parentElement.getAttribute('data_layer');
      this.activeLayerIndex && this.canvas.setActiveObject(this.canvas.item(this.activeLayerIndex));
      this.canvas.requestRenderAll();
    });

    this.canvas.on('after:render', () => {
      this.rotateObject();
      this.scaleObject();
    });

    let openTextPickerView = 'block';
    let openPickerView = 'block';

    let pickerDefaultColor = '#fff';
    let colorPicker = new iro.ColorPicker('#open_picker', {
      display: openPickerView,
      width: 210,
      marginTop: 20,
      color: pickerDefaultColor,
      layout: [
        {
          component: iro.ui.Box,
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'hue',
          },
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'alpha',
          },
        },
      ],
    });

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

    const onSelect = () => {
      const activeObject = this.canvas.getActiveObject();
      this.activeLayerIndex = this.canvas.getObjects().indexOf(activeObject);

      !activeObject.text && activeObject.on('mousedown', updatePickerHandler(activeObject));

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

          if (idx == this.activeLayerIndex) {
            layerSpan.scrollIntoView({ block: 'center', behavior: 'smooth' });
            layerImg.classList.add('selected');
            layerSpan.classList.add('selected');
          } else {
            layerImg.classList.remove('selected');
            layerSpan.classList.remove('selected');
          }
        });
      }
      this.canvas.requestRenderAll();
    };

    this.canvas.on('selection:created', onSelect);
    this.canvas.on('selection:updated', onSelect);
    var logoLayerGroup;

    const textMain = ({ text, fontFamily = 'Poppins', fontSize = 32, fill = '#000000' }) => {
      return new fabric.Text(text, {
        fontFamily,
        fontSize,
        fill,
        selectable: true,
        hasRotatingPoint: false,
        diameter: 500,
        left: 50,
        top: 50,
        flipped: true,
      });
    };

    let logoNameElement = textMain({ text: this.logoName });
    let sloganNameElement = textMain({ text: this.sloganName });

    if (this.logoFile) {
      fabric.loadSVGFromString(this.logoFile, (objects, options) => {
        logoLayerGroup = new fabric.Group(objects, options);

        this.canvas.on('selection:created', () => {
          const selectedObjects = this.canvas.getActiveObjects();
          selectedObjects.forEach(() => {
            this.activeNavbarSetting = 'logo';
            this.updateActiveNavbar();
            this.logoSettingsContainer.style.display = 'grid';
            this.textSettingsContainer.style.display = 'none';
            this.backgroundSettingsContainer.style.display = 'none';
          });
        });

        objects.forEach((obj, idx) => {
          this.canvas.add(obj);
          const layerSection = new CreateLayerSection(this.layers);
          layerSection.create(obj, idx);

          obj.on('mousedown', (e) => {
            this.isFlipY = obj.get('flipY');
            this.isFlipX = obj.get('flipX');
            querySelect('#flip-y').checked = this.isFlipY;
            querySelect('#flip-x').checked = this.isFlipX;

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

            this.activeNavbarSetting = 'logo';
            this.updateActiveNavbar();
            this.logoSettingsContainer.style.display = 'grid';
            this.textSettingsContainer.style.display = 'none';
            this.backgroundSettingsContainer.style.display = 'none';
            this.canvas.requestRenderAll();
          });
        });

        const originalWidth = logoLayerGroup.width;
        const originalHeight = logoLayerGroup.height;

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
        this.canvas.viewportCenterObject(logoLayerGroup);
        this.initialRotation = {
          centerPoint: logoLayerGroup.getCenterPoint(),
          coords: logoLayerGroup.getCoords(),
        };
        logoLayerGroup.ungroupOnCanvas();
        this.canvas.renderAll();
      });

      this.canvas.add(logoNameElement);
      this.canvas.add(sloganNameElement);
      logoNameElement.viewportCenter();
      sloganNameElement.viewportCenter();

      const selection = new fabric.ActiveSelection(this.canvas.getObjects(), {
        canvas: this.canvas,
      });
      this.canvas.setActiveObject(selection);
      this.canvas.discardActiveObject(selection);
      this.canvas.requestRenderAll();
    }

    const getTextCase = (text) => {
      if (text === text.toUpperCase()) {
        return 'Uppercase';
      } else if (text === text.toLowerCase()) {
        return 'Lowercase';
      } else if (text === text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()) {
        return 'Sentence Case';
      } else {
        return 'Title Case';
      }
    };

    const putAngleDownIcon = (className, additionalFunction) => {
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-angle-down';
      querySelect(className).append(icon);

      if (typeof additionalFunction === 'function') {
        icon.addEventListener('click', additionalFunction);
      }
    };

    logoNameElement.on('mousedblclick', () => {
      const logoNameInput = document.getElementById('logoNameInput');
      if (logoNameInput) {
        logoNameInput.focus();
      }
    });

    sloganNameElement.on('mousedblclick', () => {
      const sloganNameInput = document.getElementById('sloganNameInput').focus();
      if (sloganNameInput) {
        sloganNameElement.focus();
      }
    });

    const onMouseOver = (isMouseOver, element) => {
      let color = isMouseOver ? 'var(--gold-darker)' : 'var(--gold)';
      element.style.background = color;
      if (!isMouseOver) {
        this.updateActiveNavbar();
      }
    };

    this.backgroundMode.addEventListener('mouseover', () => onMouseOver(true, this.backgroundMode));
    this.backgroundMode.addEventListener('mouseleave', () => onMouseOver(false, this.backgroundMode));
    this.textMode.addEventListener('mouseover', () => onMouseOver(true, this.textMode));
    this.textMode.addEventListener('mouseleave', () => onMouseOver(false, this.textMode));
    this.logoMode.addEventListener('mouseover', () => onMouseOver(true, this.logoMode));
    this.logoMode.addEventListener('mouseleave', () => onMouseOver(false, this.logoMode));
    this.previewMode.addEventListener('mouseover', () => onMouseOver(true, this.previewMode));
    this.previewMode.addEventListener('mouseleave', () => onMouseOver(false, this.previewMode));

    this.uploadSettingsContainer.style.display = 'none';
    this.backgroundSettingsContainer.style.display = 'none';
    this.textMode.addEventListener('click', () => {
      this.activeNavbarSetting = 'text';
      this.updateActiveNavbar();
      this.logoSettingsContainer.style.display = 'none';
      this.textSettingsContainer.style.display = 'grid';
      this.backgroundSettingsContainer.style.display = 'none';
      this.uploadSettingsContainer.style.display = 'none';
      this.canvas.renderAll();
    });

    this.logoMode.addEventListener('click', () => {
      this.activeNavbarSetting = 'logo';
      this.updateActiveNavbar();
      this.logoSettingsContainer.style.display = 'grid';
      this.textSettingsContainer.style.display = 'none';
      this.backgroundSettingsContainer.style.display = 'none';
      this.uploadSettingsContainer.style.display = 'none';
      this.canvas.renderAll();
    });

    this.backgroundMode.addEventListener('click', () => {
      this.backgroundSettingsContainer.style.display = 'none';
      this.logoSettingsContainer.style.display = 'none';
      this.textSettingsContainer.style.display = 'none';
      this.backgroundSettingsContainer.style.display = 'grid';
      this.uploadSettingsContainer.style.display = 'none';
      this.activeNavbarSetting = 'background';
      this.updateActiveNavbar();
    });

    this.previewMode.addEventListener('click', () => {
      this.transparentLoader();
      const bgColor = this.canvas.get('backgroundColor');

      const timeout = 1000;
      setTimeout(() => {
        if (bgColor === this.canvasBG) {
          this.canvas.setBackgroundColor(null, this.canvas.renderAll.bind(this.canvas));
        }
        this.canvas.setBackgroundImage(null, this.canvas.renderAll.bind(this.canvas));

        querySelect('.preview-modal-bg').style.display = 'block';
        const logo = this.canvas.toDataURL({
          format: 'png',
          multiplier: 3,
        });

        if (logo) {
          querySelect('#fixed_preview').src = logo;
          querySelect('#loader').style.display = 'none';
        }
      }, timeout);
    });

    this.letterSpacingSlider.addEventListener('input', (e) => {
      this.letterSpacing = e.target.value;
      const active = this.canvas.getActiveObject();
      const currCoordinate = active.getCenterPoint();

      active.set('charSpacing', this.letterSpacing);
      querySelect('#l_spacing_value').innerText = ': ' + e.target.value / 10;

      active.setPositionByOrigin(new fabric.Point(currCoordinate.x, currCoordinate.y), 'center', 'center');
      active.setCoords();
      this.canvas.requestRenderAll();
      setTimeout(() => {
        updatePreview();
      }, 100);
    });

    this.shadowBlurSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      this.shadowBlur = value;
      querySelect('#shadow_blur_title').innerText = ` :${value}px`;
      this.shadowChanger(sloganNameElement, logoNameElement);
      this.canvas.requestRenderAll();
    });

    querySelect('#logo-shadow-blur-slider').addEventListener('input', (e) => {
      this.logoShadowBlur = e.target.value;
      const active = this.canvas.getActiveObjects();
      querySelect('#logo-shadow_blur_title').innerText = ` :${e.target.value}px`;
      active.forEach((item) => {
        item.set('shadow', {
          offsetX: this.logoShadowOffsetX,
          offsetY: this.logoShadowOffsetY,
          blur: this.logoShadowBlur,
        });
      });
      this.canvas.requestRenderAll();
    });

    this.shadowOffsetXSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      this.shadowOffsetX = val;
      querySelect('#offset_x_title').innerText = ` :${val}px`;
      this.shadowChanger(sloganNameElement, logoNameElement);
      this.canvas.requestRenderAll();
    });

    this.logoShadowOffsetXSlider.addEventListener('input', (e) => {
      this.logoShadowOffsetX = e.target.value;

      querySelect('#logo-shadow_offsetX').innerText = ` :${e.target.value}px`;
      const active = this.canvas.getActiveObjects();
      active.forEach((item) => {
        item.set('shadow', {
          offsetX: this.logoShadowOffsetX,
          offsetY: this.logoShadowOffsetY,
          blur: this.logoShadowBlur,
        });
      });
      this.canvas.requestRenderAll();
    });

    this.shadowOffsetYSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      this.shadowOffsetY = val;
      querySelect('#offset_y_title').innerText = ` :${val}px`;
      this.shadowChanger(sloganNameElement, logoNameElement);
      this.canvas.requestRenderAll();
    });

    this.logoShadowOffsetYSlider.addEventListener('input', (e) => {
      this.logoShadowOffsetY = e.target.value;
      querySelect('#logo-shadow_offsetY').innerText = ` :${e.target.value}px`;
      const active = this.canvas.getActiveObjects();
      active.forEach((item) => {
        item.set('shadow', {
          offsetX: this.logoShadowOffsetX,
          offsetY: this.logoShadowOffsetY,
          blur: this.logoShadowBlur,
        });
      });
      this.canvas.requestRenderAll();
    });

    const fontList = querySelect('.font-selector-list');
    const fontSelectorTitle = querySelect('.font-selector-title');
    const caseList = querySelect('.case-list-items-li');
    const fontStyleList = querySelect('.font_style-list-items-li');

    fontSelectorTitle.addEventListener('click', (event) => {
      event.stopPropagation();

      if (fontList.classList.contains('show')) {
        fontList.classList.remove('show');
      } else {
        fontList.classList.add('show');
      }

      [fontStyleList, caseList].forEach((i) => i.classList.remove('show'));
    });

    this.fontStyleListTitle.addEventListener('click', (event) => {
      event.stopPropagation();

      if (this.fontStyleList.classList.contains('show')) {
        this.fontStyleList.classList.remove('show');
      } else {
        this.fontStyleList.classList.add('show');
      }
      [fontList, caseList].forEach((i) => i.classList.remove('show'));
    });

    document.addEventListener('click', (event) => {
      if (event.target !== fontSelectorTitle) {
        fontList.classList.remove('show');
      }
      if (event.target !== this.fontStyleListTitle) {
        this.fontStyleList.classList.remove('show');
      }
      if (event.target !== this.caseListTitle) {
        this.caseList.classList.remove('show');
      }
    });

    [logoNameElement, sloganNameElement].forEach((i) => {
      i.on('mousedown', () => {
        this.updateActiveNavbar('text');
        this.logoSettingsContainer.style.display = 'none';
        this.textSettingsContainer.style.display = 'grid';
        this.backgroundSettingsContainer.style.display = 'none';
        this.uploadSettingsContainer.style.display = 'none';
        this.canvas.renderAll();
      });
    });

    querySelect('#upload-file').addEventListener('input', (e) => {
      localDirFile = e.target.files[0];
      localDirFiles = [];
      localDirFiles.push(localDirFile);

      localDirFiles.forEach((file) => {
        fabric.Image.fromURL(URL.createObjectURL(file), (img) => {
          const originalWidth = img.width;
          const originalHeight = img.height;
          const scaleFactor = Math.min(400 / originalWidth, 400 / originalHeight);
          img.scale(scaleFactor);
          this.canvas.add(img);
          this.canvas.centerObject(img);
          this.canvas.requestRenderAll();
        });
      });
      e.target.value = '';
    });

    fontList.addEventListener('click', (e) => {
      const fontValue = e.target.innerText;
      let active = this.canvas.getActiveObject();
      const currCoordinate = active.getCenterPoint();

      switch (fontValue) {
        case 'Inter':
          active.set('fontFamily', 'Inter');
          break;
        case 'Roboto':
          active.set('fontFamily', 'Roboto');
          break;
        default:
          active.set('fontFamily', 'Poppins');
          break;
      }
      const title = this.fontSelector.querySelector('.font-selector-title');
      title.textContent = fontValue;
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-angle-down';
      title.append(icon);
      fontList.classList.remove('show');

      active.setPositionByOrigin(new fabric.Point(currCoordinate.x, currCoordinate.y), 'center', 'center');
      active.setCoords();
      this.canvas.renderAll();
    });

    const handleCanvasEvent = () => {
      captureCanvasState();
      updatePreview();
    };

    this.canvas.on('object:added', handleCanvasEvent);
    this.canvas.on('object:removed', handleCanvasEvent);
    this.canvas.on('object:modified', handleCanvasEvent);

    let localDirFile = null;
    let localDirFiles = null;
    document.onkeydown = (event) => {
      if (event.key === 'Delete') {
        const deleteLayer = new DeleteLayer(event, this.canvas, this.layers, this.activeLayerIndex);
        deleteLayer.deleteLayer();
        localDirFile = null;
      }
    };

    const colorPickerText = new iro.ColorPicker('#open_picker_text', {
      display: openTextPickerView,
      width: 210,
      marginTop: 20,
      color: pickerDefaultColor,
      transparency: false,
      layout: [
        {
          component: iro.ui.Box,
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'hue',
          },
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'alpha',
          },
        },
      ],
    });

    logoNameElement.on('mousedown', (e) => {
      e.e.preventDefault();
      this.textSelectorValue = 'LogoName';

      const hasShadow = !!logoNameElement?.shadow?.blur;

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

      const charSpacing = logoNameElement.get('charSpacing');
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

      querySelect('.font_style-list-item__title').innerText = logoNameElement.fontStyle;
      putAngleDownIcon('.font_style-list-item__title');

      const letterSpacing = logoNameElement.get('charSpacing');
      querySelect('#letter-spacing-slider').value = letterSpacing;

      const fontFamily = logoNameElement.get('fontFamily');
      querySelect('#font-selector-title').innerText = fontFamily;
      putAngleDownIcon('#font-selector-title');

      const fontSize = logoNameElement.fontSize;
      querySelect('#font_size_title').value = `${fontSize}px`;
      querySelect('#font_size_range').value = fontSize;

      const logoText = logoNameElement.text;
      querySelect('.case-list-item__title').innerText = getTextCase(logoText);

      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-angle-down';
      querySelect('.case-list-item__title').append(icon);

      if (logoNameElement.shadow) {
        const { blur, offsetX, offsetY } = logoNameElement.shadow;

        if (blur && offsetX && offsetY) {
          querySelect('#shadow_blur_title').innerText = ` :${blur}px`;
          querySelect('#shadow-blur-slider').value = blur;
          querySelect('#offset_x_title').innerText = ` :${offsetX}px`;
          querySelect('#shadow-offsetX-slider').value = offsetX;
          querySelect('#offset_y_title').innerText = ` :${offsetY}px`;
          querySelect('#shadow-offsetY-slider').value = offsetY;
        }
      }
      captureCanvasState();
      this.canvas.requestRenderAll();

      this.activeNavbarSetting = 'text';
      this.updateActiveNavbar();
    });

    sloganNameElement.on('mousedown', (e) => {
      e.e.preventDefault();
      this.textSelectorValue = 'SloganName';

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

      captureCanvasState();
      this.canvas.requestRenderAll();

      this.activeNavbarSetting = 'text';
      this.updateActiveNavbar();
    });

    const undoHistory = [];
    let currIndex = -1;
    let captureTimeout = null;
    const undoMax = 100;

    const captureCanvasState = () => {
      clearTimeout(captureTimeout);

      if (undoHistory.length < undoMax) {
        captureTimeout = setTimeout(() => {
          undoHistory.push(JSON.stringify(this.canvas));
          currIndex = undoHistory.length - 1;
        }, 100);
      } else if (undoHistory.length === undoMax) {
        currIndex = undoMax - 1;
        undoHistory.shift();
        undoHistory.push(JSON.stringify(this.canvas));
      }
    };

    const undo = () => {
      if (currIndex > 0) {
        setCanvasBackground();
        currIndex -= 1;
        const stateToRestore = JSON.parse(undoHistory[currIndex]);
        this.canvas.clear();

        const updateActiveNavbar = (activeNav = 'logo') => {
          querySelectAll('.nav-item').forEach((item) => {
            if (activeNav.includes(item.innerText.toLowerCase())) {
              this.logoSettingsContainer.style.display = 'grid';
              this.textSettingsContainer.style.display = 'none';
              this.backgroundSettingsContainer.style.display = 'none';
              this.uploadSettingsContainer.style.display = 'none';
              item.style.backgroundColor = 'var(--gold-darker)';
            } else {
              item.style.backgroundColor = 'var(--gold)';
            }
          });
        };

        this.canvas.loadFromJSON(stateToRestore, () => {
          const logoNameElement = this.canvas.getObjects().find((i) => i.text === 'My Brand Name');
          const sloganNameElement = this.canvas.getObjects().find((i) => i.text === 'Slogan goes here');

          this.canvas.getObjects().forEach((item) => {
            if (!item.text) {
              item.on('mousedown', () => {
                updateActiveNavbar('logo');
              });
            }
          });
          logoNameElement.on('mousedown', (e) => {
            e.e.preventDefault();
            this.textSelectorValue = 'LogoName';

            querySelect('#drop-shadow').checked = !!logoNameElement?.shadow?.blur;

            if (!!logoNameElement?.shadow?.blur) {
              querySelect('#logo-shadow-adjust').style.display = 'block';
              querySelect('#logo-shadow-blur').style.display = 'block';
              querySelect('#logo-shadow-offsetX').style.display = 'block';
              querySelect('#logo-shadow-offsetY').style.display = 'block';
              querySelect('#logo-shadow-border').style.display = 'block';
            }

            let fillColor;
            const color = logoNameElement.get('fill');

            if (color.includes('#')) {
              fillColor = color;
            } else {
              const newColor = rgbaToHex(color);
              fillColor = newColor;
            }

            colorPickerText.color.set(fillColor);

            querySelect('.font_style-list-item__title').innerText = logoNameElement.fontStyle;
            putAngleDownIcon('.font_style-list-item__title');

            const letterSpacing = logoNameElement.get('charSpacing');
            querySelect('#letter-spacing-slider').value = letterSpacing;

            const fontFamily = logoNameElement.fontFamily;
            querySelect('#font-selector-title').innerText = fontFamily;
            putAngleDownIcon('#font-selector-title');

            const fontSize = logoNameElement.fontSize;
            querySelect('#font_size_title').value = `${fontSize}px`;
            querySelect('#font_size_range').value = fontSize;

            const logoText = logoNameElement.text;
            querySelect('.case-list-item__title').innerText = getTextCase(logoText);
            putAngleDownIcon('.case-list-item__title');

            if (logoNameElement.shadow) {
              const { blur, offsetX, offsetY } = logoNameElement.shadow;

              if (blur && offsetX && offsetY) {
                querySelect('#shadow_blur_title').innerText = ` :${blur}px`;
                querySelect('#shadow-blur-slider').value = blur;
                querySelect('#offset_x_title').innerText = ` :${offsetX}px`;
                querySelect('#shadow-offsetX-slider').value = offsetX;
                querySelect('#offset_y_title').innerText = ` :${offsetY}px`;
                querySelect('#shadow-offsetY-slider').value = offsetY;
              }
            }
            captureCanvasState();
            this.canvas.requestRenderAll();
            updateActiveNavbar('text');

            this.logoSettingsContainer.style.display = 'none';
            this.textSettingsContainer.style.display = 'grid';
            this.backgroundSettingsContainer.style.display = 'none';
          });

          sloganNameElement.on('mousedown', (event) => {
            event.e.preventDefault();
            this.textSelectorValue = 'SloganName';

            querySelect('#drop-shadow').checked = !!sloganNameElement?.shadow?.blur;

            if (!!sloganNameElement?.shadow?.blur) {
              querySelect('#logo-shadow-adjust').style.display = 'block';
              querySelect('#logo-shadow-blur').style.display = 'block';
              querySelect('#logo-shadow-offsetX').style.display = 'block';
              querySelect('#logo-shadow-offsetY').style.display = 'block';
              querySelect('#logo-shadow-offsetY').style.display = 'block';
              querySelect('#logo-shadow-border').style.display = 'block';
            }

            let fillColor;
            const color = sloganNameElement.get('fill');

            if (color.includes('#')) {
              fillColor = color;
            } else {
              const newColor = rgbaToHex(color);
              fillColor = newColor;
            }

            colorPickerText.color.set(fillColor);

            querySelect('.font_style-list-item__title').innerText = sloganNameElement.fontStyle;
            putAngleDownIcon('.font_style-list-item__title');
            const fontSize = sloganNameElement.fontSize;
            querySelect('#font_size_range').value = fontSize;

            const letterSpacing = +sloganNameElement.charSpacing;
            querySelect('#letter-spacing-slider').value = letterSpacing;

            querySelect('#font_size_title').value = `${fontSize}px`;

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

            captureCanvasState();
            this.canvas.requestRenderAll();
            updateActiveNavbar('text');

            this.logoSettingsContainer.style.display = 'none';
            this.textSettingsContainer.style.display = 'grid';
            this.backgroundSettingsContainer.style.display = 'none';
          });

          querySelectAll('#solid_color').forEach((item) => {
            item.addEventListener('click', (event) => {
              if (this.canvas) {
                const activeObj = this.canvas.getActiveObject();
                if (activeObj) {
                  const bgColor = event.target.style.backgroundColor;
                  const match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(bgColor);
                  if (match) {
                    const red = parseInt(match[1]);
                    const green = parseInt(match[2]);
                    const blue = parseInt(match[3]);
                    const hexColor = convertRGBtoHex(red, green, blue);
                    activeObj.set('fill', hexColor);

                    const logoColorPickers = querySelectAll('#color-layers-pickers');
                    logoColorPickers.forEach((i) => i.remove());

                    let colorSet = new Set();

                    this.canvas.getObjects().forEach((item) => {
                      let itemFill = item.get('fill');
                      const colPicker = document.createElement('div');

                      if (getParsedColor(itemFill) !== undefined) {
                        let color = getParsedColor(itemFill);
                        color = color.padEnd(7, '0');

                        if (!colorSet.has(color)) {
                          colorSet.add(color);
                          colPicker.setAttribute('id', 'color-layers-pickers');

                          colPicker.style.background = itemFill;
                          colPicker.className = 'color-picker';
                          colPicker.style.borderRadius = '5px';
                          colorPalette.append(colPicker);
                        }

                        colPicker.addEventListener('click', (event) => {
                          const color = rgbToHex(event.target.style.backgroundColor);
                          const active = this.canvas.getActiveObject();
                          active.set('fill', color);
                          this.canvas.requestRenderAll();
                        });
                      }
                    });

                    captureCanvasState();
                    this.canvas.requestRenderAll();
                    updatePreview();
                  }
                }
              }
            });
          });

          querySelectAll('#solid_color_text').forEach((item) => {
            item.addEventListener('click', (event) => {
              const activeObj = this.canvas.getActiveObject();
              if (activeObj) {
                const bgColor = event.target.style.backgroundColor;
                const match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(bgColor);
                if (match) {
                  const red = parseInt(match[1]);
                  const green = parseInt(match[2]);
                  const blue = parseInt(match[3]);
                  const hexColor = convertRGBtoHex(red, green, blue);
                  activeObj.set('fill', hexColor);

                  this.canvas.requestRenderAll();
                  captureCanvasState();
                  updatePreview();
                }
              }
            });
          });
        });
      }
    };

    const redo = () => {
      if (currIndex < undoHistory.length - 1) {
        setCanvasBackground();
        currIndex += 1;
        const stateToRestore = JSON.parse(undoHistory[currIndex]);
        this.canvas.clear();

        this.canvas.loadFromJSON(stateToRestore, () => {
          this.canvas.requestRenderAll();
        });
      }
    };

    querySelect('#undo-btn').addEventListener('click', undo);
    querySelect('#redo-btn').addEventListener('click', redo);

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'z') {
        undo();
      }

      if (e.ctrlKey && e.key === 'y') {
        redo();
        this.canvas.requestRenderAll();
      }
    });

    querySelect('#font_size_range').addEventListener('input', (event) => {
      const textSize = event.target.value;
      if (textSize > 0) {
        querySelect('#font_size_title').value = `${textSize}px`;
        const active = this.canvas.getActiveObject();
        const fontSize = textSize;
        active.fontSize = fontSize;
        this.canvas.renderAll();
        updatePreview();
      }
    });

    querySelect('#font_size_title').addEventListener('input', (event) => {
      const text = event.target.value;
      const fontSize = Number(text.split('px')[0]);
      const active = this.canvas.getActiveObject();
      active.fontSize = fontSize;
      querySelect('#font_size_range').value = fontSize;

      this.canvas.requestRenderAll();
    });

    const arrowFontResizer = (type = 'increment') => {
      const active = this.canvas.getActiveObject();
      let fontSize = parseInt(active.fontSize);

      if (fontSize <= 1) {
        fontSize = 2;
      }
      const increment = fontSize + 1;
      const decrement = fontSize - 1;

      const fontResizer =
        type === 'increment' ? (active.fontSize = increment) : (active.fontSize = decrement);
      querySelect('#font_size_range').value = fontResizer;
      querySelect('#font_size_title').value = fontResizer + 'px';
      this.canvas.requestRenderAll();
      updatePreview();
    };

    querySelect('#font_size_up').addEventListener('click', () => void arrowFontResizer('increment'));
    querySelect('#font_size_down').addEventListener('click', () => void arrowFontResizer('decrement'));

    querySelect('#font_size_title').addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp') {
        let curr = Number(event.target.value.split('px')[0]);
        event.target.value = curr + 1 + 'px';
      } else if (event.key === 'ArrowDown') {
        let curr = Number(event.target.value.split('px')[0]);
        event.target.value = curr - 1 + 'px';
      }

      const active = this.canvas.getActiveObject();
      active.fontSize = Number(event.target.value.split('px')[0]);

      this.canvas.requestRenderAll();
    });

    const convertFabricColorsToRGB = (canvasObj) => {
      if (!canvasObj || canvasObj.type !== 'radial' || !canvasObj.colorStops) {
        console.error('Invalid canvas object or missing color information.');
        return [];
      }

      const colors = canvasObj.colorStops.map((colorStop) => {
        const { color } = colorStop;
        const rgbValues = color.match(/\d+/g);
        if (rgbValues.length !== 3) {
          console.error('Invalid color format:', color);
          return null;
        }
        return `rgb(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]})`;
      });

      return colors.filter((color) => color !== null);
    };

    this.zoomSlider.addEventListener('input', () => {
      let imgZoom = this.zoomSlider.value * 2;
      if (imgZoom <= 2) {
        imgZoom -= 2.5;
      } else {
        imgZoom += 2.5;
      }
      document.getElementById('magnifier_img').style.scale = imgZoom;
      document.getElementById('magnifier_img').style.rotate = '180deg';
      this.canvas.zoomToPoint(
        new fabric.Point(this.canvas.width / 2, this.canvas.height / 2),
        1 / this.zoomSlider.value
      );
      this.canvas.requestRenderAll();
    });

    querySelect('#copyElement').addEventListener('click', () => {
      const active = this.canvas.getActiveObject();

      if (active._objects) {
        active.clone((clonedGroup) => {
          clonedGroup._objects.forEach((object) => {
            this.canvas.add(object);
          });
          this.canvas.centerObject(clonedGroup);
          clonedGroup.set('top', 100);
          clonedGroup.set('left', 100);
          this.canvas.setActiveObject(clonedGroup);
          this.canvas.discardActiveObject();
          this.canvas.requestRenderAll();
        });
      } else {
        active.clone((cloned) => {
          this.canvas.add(cloned);
          cloned.top += 10;
          cloned.left += 10;
        });
      }
      this.canvas.requestRenderAll();
    });

    querySelect('#eyeElement').addEventListener('click', () => {
      const activeObj = this.canvas.getActiveObject();
      let visibilty = Boolean(activeObj.get('opacity'));
      visibilty = !visibilty;
      activeObj.set('opacity', visibilty ? 1 : 0);
      this.canvas.requestRenderAll();
    });

    querySelect('#removeElement').addEventListener('click', () => {
      const activeObj = this.canvas.getActiveObject();
      if (activeObj) {
        this.canvas.remove(activeObj);
        this.canvas.renderAll();
      }
    });

    querySelect('#bringDownElement').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.sendBackwards(selectedObject);
      this.canvas.requestRenderAll();
    });

    querySelect('#bringUpElement').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.bringForward(selectedObject);
      this.canvas.requestRenderAll();
    });

    querySelect('#copyElement2').addEventListener('click', () => {
      const activeObject = this.canvas.getActiveObject();
      activeObject.clone((cloned) => {
        this.canvas.add(cloned);
        cloned.top += 10;
        cloned.left += 10;
      });
      this.canvas.requestRenderAll();
    });

    querySelect('#eyeElement2').addEventListener('click', () => {
      const activeObj = this.canvas.getActiveObject();
      let visibilty = Boolean(activeObj.get('opacity'));
      visibilty = !visibilty;
      activeObj.set('opacity', visibilty ? 1 : 0);
      this.canvas.requestRenderAll();
    });

    querySelect('#removeElement2').addEventListener('click', () => {
      const activeObj = this.canvas.getActiveObject();
      this.canvas.remove(activeObj);
      this.canvas.requestRenderAll();
    });

    querySelect('#bringDownElement2').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.sendBackwards(selectedObject);
      this.canvas.requestRenderAll();
    });

    querySelect('#bringUpElement2').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.bringForward(selectedObject);
      this.canvas.requestRenderAll();
    });

    querySelect('#eyeElement-uploads').addEventListener('click', () => {
      const activeObj = this.canvas.getActiveObject();
      let visibilty = activeObj.visible;
      visibilty = !visibilty;
      activeObj.set('visible', visibilty);
      this.canvas.requestRenderAll();
    });

    querySelect('#copyElement-uploads').addEventListener('click', (event) => {
      this.canvas.getActiveObject().clone((cloned) => {
        this.canvas.add(cloned);
        this.canvas.centerObject(cloned);
        this.canvas.requestRenderAll();
      });
    });

    querySelect('#bringUpElement-uploads').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.bringForward(selectedObject);
      this.canvas.requestRenderAll();
    });

    querySelect('#bringDownElement-uploads').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.sendBackwards(selectedObject);
      this.canvas.requestRenderAll();
    });

    const palleteComponent = querySelect('#bg-pallete');
    palleteComponent.addEventListener('colorChange', (e) => {
      const { colorMode, grad1Value, grad2Value, colorAngle, solidValue } = e.detail;

      let angleColor = `${colorAngle}deg`;
      let color = null;
      if (colorMode === 'Linear') {
        color = new fabric.Gradient({
          type: 'linear',
          coords: {
            x1: 0,
            y1: 0,
            x2: this.canvas.width,
            y2: this.canvas.height,
            angle: colorAngle,
          },
          colorStops: [
            { offset: 0, color: grad1Value },
            { offset: 1, color: grad2Value },
          ],
        });
      } else if (colorMode === 'None') {
        setCanvasBackground();
        this.canvas.setBackgroundColor('#eeeeee', this.canvas.renderAll.bind(this.canvas));
        this.canvas.requestRenderAll();
      } else {
        color = solidValue;
      }

      this.canvas.backgroundColor = color;
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

      this.canvas.add(rect);
      rect.center();
      this.canvas.remove(rect);

      this.canvas.requestRenderAll();
      setTimeout(() => {
        updatePreview();
      }, 100);
    });

    const logoPalleteComponent = querySelect('#logo-pallete');
    logoPalleteComponent.addEventListener('colorChange', (e) => {
      const selectedObject = this.canvas.getActiveObject();
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
      this.canvas.requestRenderAll();
      setTimeout(() => {
        updatePreview();
      }, 100);
    });

    const textPalleteComponent = querySelect('#text-pallete');
    textPalleteComponent.addEventListener('colorChange', (e) => {
      const selectedObject = this.canvas.getActiveObject();
      const { colorMode, grad1Value, grad2Value, solidValue } = e.detail;

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
      this.canvas.requestRenderAll();
      setTimeout(() => {
        updatePreview();
      }, 100);
    });

    updatePreview();

    let previewImages = ['/static/mug.png', '/static/wall.png'];
    let counter = previewImages.length - 1;

    querySelect('#right-arrow').addEventListener('click', () => {
      counter++;
      if (counter >= previewImages.length) {
        counter = 0;
      }

      const img = previewImages[counter];

      querySelect('.preview_image_wrapper').style.backgroundImage = 'url(' + img.toString() + ')';
      querySelect('.preview_image').style.marginTop = counter === 0 ? '100px' : '-100px';
    });

    querySelect('#left-arrow').addEventListener('click', () => {
      if (counter === 0) {
        counter = previewImages.length - 1;
      } else {
        counter--;
      }

      const img = previewImages[counter];

      querySelect('.preview_image_wrapper').style.backgroundImage = 'url(' + img.toString() + ')';
      querySelect('.preview_image').style.marginTop = counter === 0 ? '100px' : '-100px';
    });

    querySelect('#close_modal').addEventListener('click', () => {
      setCanvasBackground();
      this.canvas.setBackgroundColor(this.canvasBG, this.canvas.renderAll.bind(this.canvas));
      querySelect('.preview-modal-bg').style.display = 'none';
    });

    querySelect('#overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('overlay')) {
        setCanvasBackground();
        this.canvas.setBackgroundColor('#eee', this.canvas.renderAll.bind(this.canvas));
        querySelect('.preview-modal-bg').style.display = 'none';
      }
    });

    querySelect('#icon-search-input').addEventListener('input', (event) => {
      const textInput = event.target.value;
      querySelectAll('#clip-icon').forEach((icon) => {
        if (!icon['name'].toLowerCase().includes(textInput.toLowerCase())) {
          icon.style.display = 'none';
        } else {
          icon.style.display = 'grid';
        }
      });
    });

    querySelect('.popup').addEventListener('click', (e) => {
      if (e.target.classList.contains('popup')) {
        querySelect('#popup-parent').style.display = 'none';
      }
    });

    document.getElementById('close-btn').addEventListener('click', (e) => {
      querySelect('#popup-parent-icons').style.display = 'none';
    });

    clipIcons.map((icon) => {
      const svgDataUrl = `data:image/svg+xml;charset=utf-8, ${encodeURIComponent(icon.svg)}`;
      const img = document.createElement('img');
      img.setAttribute('id', 'clip-icon');
      img.classList.add('clip-icon');
      img.setAttribute('name', icon.name);
      img.src = svgDataUrl;
      querySelect('#clip-icons').append(img);
    });

    document.getElementById('clip-icons').addEventListener('click', (e) => {
      const targetSrc = e.target.src;
      const decodedSrc = decodeURIComponent(targetSrc);

      const canvas = this.canvas;

      fabric.loadSVGFromURL(decodedSrc, (objects, options) => {
        const img = fabric.util.groupSVGElements(objects, options);
        img.scaleToWidth(50);
        img.set({ left: img.left + 100 });
        canvas.add(img);
        canvas.viewportCenterObjectV(img);
        canvas.requestRenderAll();
      });

      document.getElementById('popup-parent-icons').style.display = 'none';
    });

    querySelect('#clipart').addEventListener('click', (e) => {
      querySelect('#popup-parent').style.display = 'none';
      querySelect('#popup-parent-icons').style.display = 'block';
    });

    querySelect('.item-title').addEventListener('click', (e) => {
      const IText = new fabric.IText('Add Text', { fontFamily: 'Poppins' });
      this.canvas.add(IText);
      IText.center();
      IText.set('left', IText.top + 50);
      updatePreview();
      this.canvas.requestRenderAll();
      this.canvas.setActiveObject(IText);
      querySelect('#popup-parent').style.display = 'none';
    });

    let isLogoShadowAdjust = false;
    querySelect('#logo-drop-shadow').addEventListener('change', () => {
      const active = this.canvas.getActiveObject();
      isLogoShadowAdjust = !isLogoShadowAdjust;

      if (isLogoShadowAdjust) {
        querySelect('#logo-shadow-adjust').style.display = 'block';
        const settingsView = querySelect('.settings-view');
        settingsView.scrollTop = settingsView.scrollHeight;

        if (active._objects) {
          active.forEachObject((obj) => {
            obj.set('shadow', {
              offsetX: 2,
              offsetY: 2,
              blur: 5,
            });
          });
        } else {
          active.set('shadow', {
            offsetX: 2,
            offsetY: 2,
            blur: 5,
          });
        }

        this.canvas.requestRenderAll();
      } else {
        querySelect('#logo-shadow-adjust').style.display = 'none';
        querySelect('#logo-shadow-blur').style.display = 'none';
        querySelect('#logo-shadow-offsetX').style.display = 'none';
        querySelect('#logo-shadow-offsetY').style.display = 'none';
        querySelect('#logo-shadow-border').style.display = 'none';

        const active = this.canvas.getActiveObject();

        if (active._objects) {
          active.forEachObject((obj) => {
            obj.set('shadow', {
              offsetX: 0,
              offsetY: 0,
              blur: 0,
            });
          });
        } else {
          active.set('shadow', {
            offsetX: 0,
            offsetY: 0,
            blur: 0,
          });
        }

        this.canvas.requestRenderAll();
      }
    });

    let isLogoDropShadow = false;
    querySelect('#logo-shadow-adjust').addEventListener('click', () => {
      const active = this.canvas.getActiveObject();
      isLogoDropShadow = !isLogoDropShadow;
      if (isLogoDropShadow) {
        querySelect('#logo-shadow-blur').style.display = 'block';
        querySelect('#logo-shadow-offsetX').style.display = 'block';
        querySelect('#logo-shadow-offsetY').style.display = 'block';
        querySelect('#logo-shadow-border').style.display = 'block';

        const settingsView = querySelect('.settings-view');
        settingsView.scrollTop = settingsView.scrollHeight;
      } else {
        querySelect('#logo-shadow-blur').style.display = 'none';
        querySelect('#logo-shadow-offsetX').style.display = 'none';
        querySelect('#logo-shadow-offsetY').style.display = 'none';
        querySelect('#logo-shadow-border').style.display = 'none';
      }
    });

    let isShadowAdjust = false;
    querySelect('#drop-shadow').addEventListener('change', () => {
      isShadowAdjust = !isShadowAdjust;
      const active = this.canvas.getActiveObject();

      if (isShadowAdjust) {
        querySelect('#shadow-adjust').style.display = 'block';
        const settingsView = querySelect('.settings-view');
        settingsView.scrollTop = settingsView.scrollHeight;

        if (active._objects) {
          active.forEachObject((obj) => {
            obj.set('shadow', {
              offsetX: 2,
              offsetY: 2,
              blur: 5,
            });
          });
        } else {
          active.set('shadow', {
            offsetX: 2,
            offsetY: 2,
            blur: 5,
          });
        }

        this.canvas.requestRenderAll();
      } else {
        querySelect('#shadow-adjust').style.display = 'none';
        querySelect('#shadow-blur').style.display = 'none';
        querySelect('#shadow-offsetX').style.display = 'none';
        querySelect('#shadow-offsetY').style.display = 'none';

        if (active._objects) {
          active.forEachObject((obj) => {
            obj.set('shadow', {
              offsetX: 0,
              offsetY: 0,
              blur: 0,
            });
          });
        } else {
          active.set('shadow', {
            offsetX: 0,
            offsetY: 0,
            blur: 0,
          });
        }
        this.canvas.requestRenderAll();
      }
    });

    let isDropShadow = false;
    querySelect('#shadow-adjust').addEventListener('click', () => {
      isDropShadow = !isDropShadow;
      if (isDropShadow) {
        querySelect('#shadow-blur').style.display = 'block';
        querySelect('#shadow-offsetX').style.display = 'block';
        querySelect('#shadow-offsetY').style.display = 'block';
        const settingsView = querySelect('.settings-view');
        settingsView.scrollTop = settingsView.scrollHeight;
      } else {
        querySelect('#shadow-blur').style.display = 'none';
        querySelect('#shadow-offsetX').style.display = 'none';
        querySelect('#shadow-offsetY').style.display = 'none';
      }
    });

    const canvasObjects = this.canvas.getObjects();
    const colorPalette = querySelect('#logo_colors_pallete');
    const textPalette = querySelect('#logo_text_colors_pallete');

    const solidColorMode = querySelect('#solid_color_mode');
    const pickerColorMode = querySelect('#picker_color_mode');

    const solidColorTextMode = querySelect('#solid_color_text_mode');
    const pickerColorTextMode = querySelect('#picker_color_text_mode');

    const getParsedColor = (color) => {
      if (color && typeof color === 'string') {
        if (color?.includes('#')) {
          return color;
        } else if (color && color.colorStops) {
          return rgbToHex(color?.colorStops[0]?.color);
        } else {
          return rgbToHex(color);
        }
      }
    };

    const updateColorPickers = () => {
      let colorSet = new Set();

      canvasObjects.forEach((item, idx) => {
        let itemFill = item.get('fill');
        const colPicker = document.createElement('div');

        if (getParsedColor(itemFill) !== undefined) {
          let color = getParsedColor(itemFill);
          color = color.padEnd(7, '0');

          if (!colorSet.has(color)) {
            colorSet.add(color);
            colPicker.setAttribute('id', 'color-layers-pickers');

            colPicker.style.background = itemFill;
            colPicker.className = 'color-picker';
            colPicker.style.borderRadius = '5px';
            colorPalette.append(colPicker);
            if (color.includes('#ffffff')) {
              colPicker.style.border = '1px solid #aaaaaa';
            }
          }
          colPicker.addEventListener('click', (event) => {
            const color = rgbToHex(event.target.style.backgroundColor);
            const activeElem = this.canvas.getActiveObject();
            activeElem.set('fill', color);
            colorPicker.color.set(color);
            querySelect('#HEX').value = color;

            let rgbValue = hexToRgb(color);
            let rgbValues = rgbValue.match(/\d+/g);

            if (rgbValues && rgbValues.length === 3) {
              querySelect('#R').value = rgbValues[0];
              querySelect('#G').value = rgbValues[1];
              querySelect('#B').value = rgbValues[2];
            }
            let hslValue = hexToHsl(color);
            let hslValues = hslValue.match(/\d+/g);

            if (hslValues && hslValues.length === 3) {
              querySelect('#H').value = hslValues[0];
              querySelect('#S').value = hslValues[1];
              querySelect('#L').value = hslValues[2];
            }
            this.canvas.renderAll();
            updatePreview();
          });
        }
      });

      captureCanvasState();
    };

    updateColorPickers();

    colorPicker.on('color:init', (color) => {
      color.set(pickerDefaultColor);
    });

    let colorChanging = false;
    colorPicker.on('input:change', (color) => {
      colorChanging = true;

      pickerDefaultColor = color.rgbaString;

      if (color.index === 0) {
        const hsl = color.hsl;
        const rgb = color.rgb;

        querySelect('#H').value = hsl.h;
        querySelect('#S').value = hsl.s;
        querySelect('#L').value = hsl.l;
        querySelect('#R').value = rgb.r;
        querySelect('#G').value = rgb.g;
        querySelect('#B').value = rgb.b;

        querySelect('#HEX').value = color.hexString;
      }

      const active = this.canvas.getActiveObject();
      active.set('fill', color.rgbaString);

      const logoColorPickers = querySelectAll('#color-layers-pickers');
      logoColorPickers.forEach((i) => i.remove());
      updateColorPickers();
      this.canvas.requestRenderAll();

      colorChanging = false;
    });

    [('#R', '#G', '#B')].forEach((id) => {
      querySelect(id).addEventListener('input', () => {
        let r = querySelect('#R').value;
        let g = querySelect('#G').value;
        let b = querySelect('#B').value;
        colorPicker.color.rgb = { r, g, b };
        const a = this.canvas.getActiveObject();
        a.set('fill', colorPicker.color.hexString);
        this.canvas.requestRenderAll();
      });
    });

    ['#H', '#S', '#L'].forEach((id) => {
      querySelect(id).addEventListener('input', () => {
        let h = querySelect('#H').value;
        let s = querySelect('#S').value;
        let l = querySelect('#L').value;
        colorPicker.color.hsl = { h, s, l };
        const a = this.canvas.getActiveObject();
        a.set('fill', colorPicker.color.hexString);
        this.canvas.requestRenderAll();
      });
    });

    [('#R2', '#G2', '#B2')].forEach((id) => {
      querySelect(id).addEventListener('input', () => {
        let r = querySelect('#R2').value;
        let g = querySelect('#G2').value;
        let b = querySelect('#B2').value;
        colorPicker.color.rgb = { r, g, b };
        const a = this.canvas.getActiveObject();
        a.set('fill', colorPicker.color.hexString);
        this.canvas.requestRenderAll();
      });
    });

    ['#H2', '#S2', '#L2'].forEach((id) => {
      querySelect(id).addEventListener('input', () => {
        let h = querySelect('#H2').value;
        let s = querySelect('#S2').value;
        let l = querySelect('#L2').value;
        colorPicker.color.hsl = { h, s, l };
        const a = this.canvas.getActiveObject();
        a.set('fill', colorPicker.color.hexString);
        this.canvas.requestRenderAll();
      });
    });

    let inputCountBG = 0;
    let inputCount2 = 0;

    querySelect('#HEX').addEventListener('input', (e) => {
      let hex = e.target.value;

      if (hex.length > 0 && hex[0] !== '#') {
        if (inputCountBG >= 3) {
          hex = '#' + hex;
          querySelect('#HEX').value = hex;
          inputCountBG = 0;
        } else {
          inputCountBG++;
        }
      }

      colorPicker.color.set(hex);
      const a = this.canvas.getActiveObject();
      a.set('fill', hex);

      let r = querySelect('#R').value;
      let g = querySelect('#G').value;
      let b = querySelect('#B').value;
      colorPicker.color.rgb = { r, g, b };
      let h = querySelect('#H').value;
      let s = querySelect('#S').value;
      let l = querySelect('#L').value;
      colorPicker.color.hsl = { h, s, l };

      this.canvas.requestRenderAll();
    });

    querySelect('#HEX2').addEventListener('input', (e) => {
      let hex = e.target.value;

      if (hex.length > 0 && hex[0] !== '#') {
        if (inputCount2 >= 3) {
          hex = '#' + hex;
          querySelect('#HEX2').value = hex;
          inputCount2 = 0;
        } else {
          inputCount2++;
        }
      }

      colorPicker.color.set(hex);
      const a = this.canvas.getActiveObject();
      a.set('fill', hex);

      let r = querySelect('#R2').value;
      let g = querySelect('#G2').value;
      let b = querySelect('#B2').value;
      colorPicker.color.rgb = { r, g, b };
      let h = querySelect('#H2').value;
      let s = querySelect('#S2').value;
      let l = querySelect('#L2').value;
      colorPicker.color.hsl = { h, s, l };

      this.canvas.requestRenderAll();
    });

    const solidColorEvent = () => {
      querySelect('#picker_color_mode').classList.remove('category_selected');
      querySelect('#solid_color_mode').classList.add('category_selected');
      querySelect('#solid_color_items').style.display = 'flex';
      querySelect('#picker_color_items').style.display = 'none';
      openPickerView = 'none';
    };

    const pickerColorEvent = () => {
      querySelect('#solid_color_items').style.display = 'none';
      querySelect('#picker_color_items').style.display = 'flex';
      querySelect('#solid_color_mode').classList.remove('category_selected');
      querySelect('#picker_color_mode').classList.add('category_selected');
      querySelect('#picker_color_items').style.marginTop = '8px';
      openTextPickerView = 'block';
    };

    const solidTextColorEvent = () => {
      querySelect('#picker_color_text_mode').classList.remove('category_selected');
      querySelect('#solid_color_text_mode').classList.add('category_selected');
      querySelect('#solid_color_items_text').style.display = 'flex';
      querySelect('#picker_color_items_text').style.display = 'none';
      openPickerView = 'none';
    };

    const pickerTextColorEvent = () => {
      querySelect('#solid_color_items_text').style.display = 'none';
      querySelect('#picker_color_items_text').style.display = 'flex';
      querySelect('#solid_color_text_mode').classList.remove('category_selected');
      querySelect('#picker_color_text_mode').classList.add('category_selected');
      querySelect('#picker_color_items_text').style.marginTop = '8px';
      openTextPickerView = 'block';
    };

    let openPickerViewBG = 'block';
    let pickerDefaultColorBG = '#fff';

    let colorPickerBG = new iro.ColorPicker('#openTextPickerViewBG', {
      display: openPickerViewBG,
      width: 210,
      marginTop: 20,
      color: pickerDefaultColorBG,
      layout: [
        {
          component: iro.ui.Box,
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'hue',
          },
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: 'alpha',
          },
        },
      ],
    });

    const solidTextColorEventBG = () => {
      querySelect('#picker_color_text_modeBG').classList.remove('category_selected');
      querySelect('#solid_color_text_modeBG').classList.add('category_selected');

      querySelect('#bg_solid_color_items_text').style.display = 'flex';
      querySelect('#bg_picker_color_items_text').style.display = 'none';
      openPickerViewBG = 'none';
    };

    const pickerTextColorEventBG = () => {
      querySelect('#bg_solid_color_items_text').style.display = 'none';
      querySelect('#bg_picker_color_items_text').style.display = 'flex';

      querySelect('#solid_color_text_modeBG').classList.remove('category_selected');
      querySelect('#picker_color_text_modeBG').classList.add('category_selected');

      querySelect('#bg_picker_color_items_text').style.marginTop = '8px';
      openPickerViewBG = 'block';
    };

    solidTextColorEventBG();

    querySelect('#solid_color_text_modeBG').addEventListener('click', () => {
      solidTextColorEventBG();
    });

    querySelect('#picker_color_text_modeBG').addEventListener('click', () => {
      pickerTextColorEventBG();
    });

    [('#R_BG', '#G_BG', '#B_BG')].forEach((id) => {
      querySelect(id).addEventListener('input', () => {
        const r = querySelect('#R_BG').value;
        const g = querySelect('#G_BG').value;
        const b = querySelect('#B_BG').value;
        colorPickerBG.color.rgb = { r, g, b };
        const bgColor = colorPickerBG.color.hexString;
        this.canvas.setBackgroundColor(bgColor);
        this.canvas.requestRenderAll();
      });
    });

    ['#H_BG', '#S_BG', '#L_BG'].forEach((id) => {
      querySelect(id).addEventListener('input', () => {
        const h = querySelect('#H_BG').value;
        const s = querySelect('#S_BG').value;
        const l = querySelect('#L_BG').value;
        colorPickerBG.color.hsl = { h, s, l };
        const bgColor = colorPickerBG.color.hexString;
        this.canvas.setBackgroundColor(bgColor);
        this.canvas.requestRenderAll();
      });
    });

    querySelect('#HEX_BG').addEventListener('input', (e) => {
      let inputCountBG = 0;
      let inputValue = e.target.value;

      if (inputValue.length > 0 && inputValue[0] !== '#') {
        if (inputValue.length >= 3) {
          inputValue = '#' + inputValue;
          querySelect('#HEX_BG').value = inputValue;
          inputCountBG = 0;
        } else {
          inputCountBG++;
        }
      }

      const r = querySelect('#R_BG').value;
      const g = querySelect('#G_BG').value;
      const b = querySelect('#B_BG').value;
      colorPickerBG.color.rgb = { r, g, b };

      const h = querySelect('#H_BG').value;
      const s = querySelect('#S_BG').value;
      const l = querySelect('#L_BG').value;
      colorPickerBG.color.hsl = { h, s, l };

      colorPickerBG.color.set(inputValue);
      this.canvas.setBackgroundColor(colorPickerBG.color.hexString);

      this.canvas.requestRenderAll();
    });

    const handleColorModeClickBG = (activeElement, element1, element2) => {
      querySelect(element1 + '_view_BG').classList.remove('color_mode_title-active');
      querySelect(element1 + '_view_BG').style.display = 'none';

      querySelect(element2 + '_view_BG').classList.remove('color_mode_title-active');
      querySelect(element2 + '_view_BG').style.display = 'none';

      querySelect(activeElement + '_view_BG').classList.add('color_mode_title-active');
      querySelect(activeElement + '_view_BG').style.display = 'flex';
    };

    querySelect('#HSL_mode_BG').addEventListener('click', () => {
      handleColorModeClickBG('#HSL', '#RGB', '#HEX');
    });

    querySelect('#RGB_mode_BG').addEventListener('click', () => {
      handleColorModeClickBG('#RGB', '#HSL', '#HEX');
    });

    querySelect('#HEX_mode_BG').addEventListener('click', () => {
      handleColorModeClickBG('#HEX', '#RGB', '#HSL');
    });
    handleColorModeClickBG('#HEX', '#RGB', '#HSL');

    colorPickerBG.on('color:init', (color) => {
      color.set(pickerDefaultColorBG);
    });

    let colorChangingBG = false;
    colorPickerBG.on('input:change', (color) => {
      colorChangingBG = true;

      pickerDefaultColorBG = color.rgbaString;

      if (color.index === 0) {
        const hsl = color.hsl;
        const rgb = color.rgb;

        querySelect('#H_BG').value = hsl.h;
        querySelect('#S_BG').value = hsl.s;
        querySelect('#L_BG').value = hsl.l;
        querySelect('#R_BG').value = rgb.r;
        querySelect('#G_BG').value = rgb.g;
        querySelect('#B_BG').value = rgb.b;

        querySelect('#HEX_BG').value = color.hexString;
      }

      this.canvas.setBackgroundColor(color.rgbaString);
      this.canvas.requestRenderAll();
      colorChangingBG = false;
    });

    solidColorEvent();
    solidTextColorEvent();

    solidColorMode.addEventListener('click', solidColorEvent);
    pickerColorMode.addEventListener('click', pickerColorEvent);

    solidColorTextMode.addEventListener('click', solidTextColorEvent);
    pickerColorTextMode.addEventListener('click', pickerTextColorEvent);

    querySelect('#custom_color_generator').addEventListener('change', (e) => {
      const color = e.target.value;

      const newColor = document.createElement('div');
      newColor.style.backgroundColor = color;
      newColor.className = 'color-picker';
      newColor.style.width = '32px';
      newColor.style.height = '32px';
      newColor.style.borderColor = color;
      newColor.style.borderRadius = '5px';

      newColor.addEventListener('click', () => {
        const activeObj = this.canvas.getActiveObject();
        activeObj.set('fill', color);
        colorPicker.color.set(color);
        querySelect('#HEX').value = color;

        let rgbValue = hexToRgb(color);
        let rgbValues = rgbValue.match(/\d+/g);

        if (rgbValues && rgbValues.length === 3) {
          querySelect('#R').value = rgbValues[0];
          querySelect('#G').value = rgbValues[1];
          querySelect('#B').value = rgbValues[2];
        }
        let hslValue = hexToHsl(color);
        let hslValues = hslValue.match(/\d+/g);

        if (hslValues && hslValues.length === 3) {
          querySelect('#H').value = hslValues[0];
          querySelect('#S').value = hslValues[1];
          querySelect('#L').value = hslValues[2];
        }
        this.canvas.renderAll();
        updatePreview();
      });

      querySelect('#custom_colors_wrapper').append(newColor);
    });

    querySelect('#custom_text_color_generator').addEventListener('change', (e) => {
      const color = e.target.value;

      const newColor = document.createElement('div');
      newColor.style.backgroundColor = color;
      newColor.className = 'color-picker';
      newColor.style.width = '32px';
      newColor.style.height = '32px';
      newColor.style.borderColor = color;
      newColor.style.borderRadius = '5px';

      newColor.addEventListener('click', () => {
        const activeObj = this.canvas.getActiveObject();
        activeObj.set('fill', color);
        colorPickerText.color.set(color);
        querySelect('#HEX2').value = color;

        let rgbValue = hexToRgb(color);
        let rgbValues = rgbValue.match(/\d+/g);

        if (rgbValues && rgbValues.length === 3) {
          querySelect('#R2').value = rgbValues[0];
          querySelect('#G2').value = rgbValues[1];
          querySelect('#B2').value = rgbValues[2];
        }
        let hslValue = hexToHsl(color);
        let hslValues = hslValue.match(/\d+/g);

        if (hslValues && hslValues.length === 3) {
          querySelect('#H2').value = hslValues[0];
          querySelect('#S2').value = hslValues[1];
          querySelect('#L2').value = hslValues[2];
        }
        this.canvas.renderAll();
        updatePreview();
      });

      querySelect('#custom_text_colors_wrapper').append(newColor);
    });

    querySelect('#custom_bg_color_generator').addEventListener('change', (e) => {
      const color = e.target.value;

      const newColor = document.createElement('div');
      newColor.style.backgroundColor = color;
      newColor.className = 'color-picker';
      newColor.style.width = '32px';
      newColor.style.height = '32px';
      newColor.style.borderColor = color;
      newColor.style.borderRadius = '5px';

      newColor.addEventListener('click', () => {
        this.canvas.setBackgroundColor(color);
        colorPickerBG.color.set(color);
        querySelect('#HEX_BG').value = color;

        let rgbValue = hexToRgb(color);
        let rgbValues = rgbValue.match(/\d+/g);

        if (rgbValues && rgbValues.length === 3) {
          querySelect('#R_BG').value = rgbValues[0];
          querySelect('#G_BG').value = rgbValues[1];
          querySelect('#B_BG').value = rgbValues[2];
        }
        let hslValue = hexToHsl(color);
        let hslValues = hslValue.match(/\d+/g);

        if (hslValues && hslValues.length === 3) {
          querySelect('#H_BG').value = hslValues[0];
          querySelect('#S_BG').value = hslValues[1];
          querySelect('#L_BG').value = hslValues[2];
        }
        this.canvas.renderAll();
        updatePreview();
      });

      querySelect('#custom_bg_colors_wrapper').append(newColor);
    });

    querySelectAll('#solid_color').forEach((item) => {
      item.addEventListener('click', (event) => {
        if (this.canvas) {
          const activeObj = this.canvas.getActiveObject();
          if (activeObj) {
            const bgColor = event.target.style.backgroundColor;
            const match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(bgColor);
            if (match) {
              const red = parseInt(match[1]);
              const green = parseInt(match[2]);
              const blue = parseInt(match[3]);
              const hexColor = convertRGBtoHex(red, green, blue);
              activeObj.set('fill', hexColor);
              colorPicker.color.set(hexColor);

              const logoColorPickers = querySelectAll('#color-layers-pickers');
              logoColorPickers.forEach((i) => i.remove());
              updateColorPickers();
              this.canvas.renderAll();
              updatePreview();
              captureCanvasState();
            }
          }
        }
      });
    });

    querySelectAll('#solid_color_text').forEach((item) => {
      item.addEventListener('click', (event) => {
        if (this.canvas) {
          const activeObj = this.canvas.getActiveObject();
          if (activeObj) {
            const bgColor = event.target.style.backgroundColor;
            const match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(bgColor);
            if (match) {
              const red = parseInt(match[1]);
              const green = parseInt(match[2]);
              const blue = parseInt(match[3]);
              const hexColor = convertRGBtoHex(red, green, blue);
              activeObj.set('fill', hexColor);
              colorPickerText.color.set(hexColor);
              this.canvas.renderAll();
              updatePreview();
              captureCanvasState();
            }
          }
        }
      });
    });

    querySelectAll('#solid_color-bg').forEach((item) => {
      item.addEventListener('click', (event) => {
        if (this.canvas) {
          const bgColor = event.target.style.backgroundColor;
          const match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(bgColor);
          if (match) {
            const red = parseInt(match[1]);
            const green = parseInt(match[2]);
            const blue = parseInt(match[3]);
            const hexColor = convertRGBtoHex(red, green, blue);
            this.canvas.setBackgroundColor(hexColor);

            const logoColorPickers = querySelectAll('#color-layers-pickers');
            logoColorPickers.forEach((i) => i.remove());
            updateColorPickers();
            this.canvas.renderAll();
            captureCanvasState();
          }
          updatePreview();
        }
      });
    });

    const updateColorTextPickers = () => {
      let itemFill, colPicker;
      canvasObjects.forEach((item) => {
        itemFill = item.get('fill');

        colPicker = document.createElement('input');
        colPicker.setAttribute('id', 'color-layers-pickers');
        colPicker.setAttribute('type', 'color');

        if (typeof itemFill === 'string') {
          colPicker.setAttribute('value', itemFill);
        } else {
          const gradientColor = itemFill.colorStops[0].color;
          const rgbValues = gradientColor.match(/\d+/g);
          if (rgbValues && rgbValues.length === 3) {
            const hexColor = convertRGBtoHex(
              parseInt(rgbValues[0]),
              parseInt(rgbValues[1]),
              parseInt(rgbValues[2])
            );
            colPicker.setAttribute('value', hexColor);
          }
        }

        colPicker.className = 'color-picker';
        colPicker.style.borderRadius = '5px';

        colPicker.addEventListener('input', (event) => {
          const color = event.target.value;
          item.set('fill', color);
          this.canvas.requestRenderAll();
        });
      });
      captureCanvasState();
      updatePreview();
    };

    updateColorTextPickers();

    colorPickerText.on('color:init', (color) => {
      color.set(pickerDefaultColor);
    });

    const changeColorPickerText = (color) => {
      pickerDefaultColor = color.rgbaString;

      if (color.index === 0) {
        const hsl = color.hsl;
        const rgb = color.rgb;

        querySelect('#H2').value = hsl.h;
        querySelect('#S2').value = hsl.s;
        querySelect('#L2').value = hsl.l;
        querySelect('#R2').value = rgb.r;
        querySelect('#G2').value = rgb.g;
        querySelect('#B2').value = rgb.b;

        querySelect('#HEX2').value = color.hexString;
      }

      const active = this.canvas.getActiveObject();
      active.set('fill', color.rgbaString);
      this.canvas.requestRenderAll();

      const logoColorPickers = querySelectAll('#color-layers-pickers');
      logoColorPickers.forEach((i) => i.remove());
      updateColorPickers();
      this.canvas.requestRenderAll();
      setTimeout(() => {
        updatePreview();
      }, 100);
    };

    colorPickerText.on('input:change', changeColorPickerText);
    colorPickerText.on('input:move', changeColorPickerText);

    const handleColorModeClick = (activeElement, element1, element2) => {
      querySelect(element1 + '_view').classList.remove('color_mode_title-active');
      querySelect(element1 + '_view').style.display = 'none';

      querySelect(element2 + '_view').classList.remove('color_mode_title-active');
      querySelect(element2 + '_view').style.display = 'none';

      querySelect(activeElement + '_view').classList.add('color_mode_title-active');
      querySelect(activeElement + '_view').style.display = 'flex';
    };

    querySelect('#HSL_mode').addEventListener('click', () => {
      handleColorModeClick('#HSL', '#RGB', '#HEX');
    });

    querySelect('#RGB_mode').addEventListener('click', () => {
      handleColorModeClick('#RGB', '#HSL', '#HEX');
    });

    querySelect('#HEX_mode').addEventListener('click', () => {
      handleColorModeClick('#HEX', '#RGB', '#HSL');
    });

    querySelect('#HSL2_mode').addEventListener('click', () => {
      handleColorModeClick('#HSL2', '#RGB2', '#HEX2');
    });

    querySelect('#RGB2_mode').addEventListener('click', () => {
      handleColorModeClick('#RGB2', '#HSL2', '#HEX2');
    });

    querySelect('#HEX2_mode').addEventListener('click', () => {
      handleColorModeClick('#HEX2', '#RGB2', '#HSL2');
    });

    handleColorModeClick('#HEX', '#RGB', '#HSL');
    handleColorModeClick('#HEX2', '#RGB2', '#HSL2');

    const centerAndResizeElements = (
      type,
      logoSize,
      sloganSize,
      textPosition,
      sloganTop,
      logoNameTop,
      letterSpaced = false
    ) => {
      const objects = this.canvas.getObjects();
      logoNameElement.charSpacing = 0;
      sloganNameElement.charSpacing = 0;
      const logoMain = objects.filter((i) => !i.text);

      const timeout = 5;

      switch (type) {
        case 'topBottom':
          setTimeout(() => {
            const logoNameElement = objects.find(
              (obj) => obj.type === 'text' && obj.text.toLowerCase() === 'my brand name'
            );

            const sloganNameElement = objects.find(
              (obj) => obj.type === 'text' && obj.text.toLowerCase() === 'slogan goes here'
            );

            logoNameElement.set('fontSize', logoSize);
            sloganNameElement.set('fontSize', sloganSize);

            logoNameElement.set('charSpacing', 0);
            sloganNameElement.set('charSpacing', 0);

            logoNameElement.centerH();
            sloganNameElement.centerH();

            logoNameElement.set('top', this.canvas.height / logoNameTop);
            sloganNameElement.set('top', this.canvas.height / sloganTop);

            if (letterSpaced) {
              logoNameElement.text = toTitleCase(logoNameElement.text);
              sloganNameElement.text = toSentenceCase(sloganNameElement.text);

              logoNameElement.set('fontFamily', 'Poppins');
              sloganNameElement.set('fontFamily', 'Poppins');

              const logoNameWidth = logoNameElement.width;
              sloganNameElement.set('width', logoNameWidth);

              sloganNameElement.set('charSpacing', 322);
              sloganNameElement.set('fontSize', 27);
            }

            logoNameElement.centerH();
            sloganNameElement.centerH();

            const newGrp = new fabric.Group(objects);
            this.canvas.viewportCenterObject(newGrp);
            newGrp.ungroupOnCanvas();
            updatePreview();
            this.canvas.requestRenderAll();
            this.logoOrientation = 'vertical';
          }, timeout);
          break;
        case 'bottomTop':
          setTimeout(() => {
            const logoNameElement = objects.find(
              (obj) => obj.type === 'text' && obj.text.toLowerCase() === 'my brand name'
            );

            const sloganNameElement = objects.find(
              (obj) => obj.type === 'text' && obj.text === 'Slogan goes here'
            );

            logoNameElement.set('fontSize', logoSize);
            sloganNameElement.set('fontSize', sloganSize);

            logoNameElement.centerH();
            sloganNameElement.centerH();

            logoNameElement.set('top', this.canvas.height / logoNameTop);
            sloganNameElement.set('top', this.canvas.height / sloganTop);

            const newGrp = new fabric.Group(objects);
            this.canvas.viewportCenterObject(newGrp);
            newGrp.ungroupOnCanvas();
            updatePreview();
            this.canvas.requestRenderAll();
            this.logoOrientation = 'vertical';
          }, timeout);
          break;
        case 'leftRight':
          setTimeout(() => {
            const logoNameElement = objects.find(
              (obj) => obj.type === 'text' && obj.text.toLowerCase() === 'my brand name'
            );

            const sloganNameElement = objects.find(
              (obj) => obj.type === 'text' && obj.text.toLowerCase() === 'slogan goes here'
            );
            logoNameElement.center();
            sloganNameElement.center();

            logoNameElement.set('top', this.canvas.height / 2.3);
            sloganNameElement.set('top', this.canvas.height / 1.9);

            logoNameElement.set('fontSize', 46);
            sloganNameElement.set('fontSize', 22);

            logoNameElement.set('charSpacing', 0);
            sloganNameElement.set('charSpacing', 0);

            if (textPosition === 'left') {
              logoNameElement.viewportCenter();
              sloganNameElement.viewportCenter();

              logoNameElement.set('top', this.canvas.height / 2.3);
              sloganNameElement.set('top', this.canvas.height / 1.9);

              logoNameElement.set('left', this.canvas.width / 2.4);
              sloganNameElement.set('left', logoNameElement.left);
            } else {
              logoNameElement.viewportCenterH();
              sloganNameElement.viewportCenterH();

              logoNameElement.set('left', this.canvas.width / 2.5);
              sloganNameElement.set(
                'left',
                logoNameElement.left + logoNameElement.width / 2 - sloganNameElement.width / 2
              );
            }

            if (letterSpaced) {
              logoNameElement.text = toTitleCase(logoNameElement.text);
              sloganNameElement.text = toSentenceCase(sloganNameElement.text);

              logoNameElement.set('fontFamily', 'Poppins');
              sloganNameElement.set('fontFamily', 'Poppins');

              sloganNameElement.set('charSpacing', 322);
              sloganNameElement.set('fontSize', 27);
              sloganNameElement.set(
                'left',
                logoNameElement.left + logoNameElement.width / 2 - sloganNameElement.width / 2
              );
            }

            logoMain.forEach((i) => (i.left -= 200));
            const newGrp = new fabric.Group(objects);
            this.canvas.viewportCenterObjectH(newGrp);
            this.canvas.viewportCenterObjectV(newGrp);
            newGrp.ungroupOnCanvas();
            updatePreview();
            this.canvas.requestRenderAll();
            this.logoOrientation = 'horizontal';
          }, timeout);
          break;
        case 'rightLeft':
          setTimeout(() => {
            const logoNameElement = objects.find(
              (obj) => obj.type === 'text' && obj.text.toLowerCase() === 'my brand name'
            );

            const sloganNameElement = objects.find(
              (obj) => obj.type === 'text' && obj.text.toLowerCase() === 'slogan goes here'
            );
            logoNameElement.center();
            sloganNameElement.center();

            logoNameElement.set('top', this.canvas.height / 2.3);
            sloganNameElement.set('top', this.canvas.height / 1.9);

            logoNameElement.set('fontSize', 46);
            sloganNameElement.set('fontSize', 22);

            logoNameElement.set('charSpacing', 0);
            sloganNameElement.set('charSpacing', 0);

            if (textPosition === 'left') {
              logoNameElement.viewportCenter();
              sloganNameElement.viewportCenter();

              logoNameElement.set('top', this.canvas.height / 2.3);
              sloganNameElement.set('top', this.canvas.height / 1.9);

              logoNameElement.set('left', this.canvas.width / 6);
              sloganNameElement.set(
                'left',
                logoNameElement.left + logoNameElement.width - sloganNameElement.width
              );

              if (letterSpaced) {
                logoNameElement.text = toTitleCase(logoNameElement.text);
                sloganNameElement.text = toSentenceCase(sloganNameElement.text);

                logoNameElement.set('fontFamily', 'Poppins');
                sloganNameElement.set('fontFamily', 'Poppins');

                sloganNameElement.set('charSpacing', 322);
                sloganNameElement.set('fontSize', 27);
                sloganNameElement.set(
                  'left',
                  logoNameElement.left + logoNameElement.width - sloganNameElement.width
                );
              }
            } else {
              logoNameElement.viewportCenterH();
              sloganNameElement.viewportCenterH();

              logoNameElement.set('left', this.canvas.width / 6);
              sloganNameElement.set(
                'left',
                logoNameElement.left + logoNameElement.width / 2 - sloganNameElement.width / 2
              );
            }

            logoMain.forEach((i) => (i.left += 150));
            const newGrp = new fabric.Group(objects);
            this.canvas.viewportCenterObjectH(newGrp);
            this.canvas.viewportCenterObjectV(newGrp);
            newGrp.ungroupOnCanvas();
            updatePreview();
            this.canvas.requestRenderAll();
            this.logoOrientation = 'horizontal';
          }, timeout);
          break;
      }
      this.canvas.requestRenderAll();
      captureCanvasState();
      this.canvas.requestRenderAll();
    };

    const scaleLogo = (scaleSize) => {
      const selection = new fabric.ActiveSelection(
        this.canvas.getObjects().filter((i) => !i.text),
        {
          canvas: this.canvas,
        }
      );

      const { width, height } = selection;
      const scaleFactor = Math.min(scaleSize / width, scaleSize / height);
      selection.scale(scaleFactor);

      selection.center();
      this.canvas.setActiveObject(selection);
      this.canvas.discardActiveObject(selection);
      this.canvas.requestRenderAll();
    };

    querySelect('#canvas-bg-none').addEventListener('click', () => {
      this.canvas.setBackgroundColor(this.canvasBG);
      updatePreview();
      this.canvas.requestRenderAll();
      captureCanvasState();
    });

    const discardSelectionForAlignments = () => {
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    };

    scaleLogo(200);
    centerAndResizeElements('topBottom', 46, 22, 'center', 1.32, 1.5);

    querySelect('#top_bottom_1').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('topBottom', 46, 22, 'center', 1.32, 1.5);
    });

    querySelect('#top_bottom_2').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('topBottom', 40, 20, 'center', 1.35, 1.52);
    });

    querySelect('#top_bottom_3').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(160);
      centerAndResizeElements('topBottom', 46, 22, 'center', 1.42, 1.6);
    });

    querySelect('#bottom_top_1').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('bottomTop', 46, 22, 'center', 3.8, 5.5);
    });

    querySelect('#bottom_top_2').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('bottomTop', 40, 18, 'center', 3.5, 5);
    });

    querySelect('#bottom_top_3').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(160);
      centerAndResizeElements('bottomTop', 46, 22, 'center', 3.3, 4.5);
    });

    querySelect('#left_right_1').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('leftRight', 32, 25, 'center', 1.32, 1.5);
    });

    querySelect('#left_right_2').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('leftRight', 32, 25, 'left', 1.32, 1.5);
    });

    querySelect('#left_right_3').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(160);
      centerAndResizeElements('leftRight', 32, 25, 'left', 1.32, 1.5);
    });

    querySelect('#right_left_1').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('rightLeft', 32, 25, 'center', 1.32, 1.5);
    });

    querySelect('#right_left_2').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(160);
      centerAndResizeElements('rightLeft', 32, 25, 'left', 1.32, 1.5);
    });

    querySelect('#right_left_3').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('rightLeft', 32, 25, 'left', 1.32, 1.5);
    });

    querySelect('#top_bottom_4').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('topBottom', 46, 22, 'center', 1.32, 1.5, true);
    });

    querySelect('#left_right_4').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('leftRight', 32, 25, 'center', 1.32, 1.5, true);
    });

    querySelect('#right_left_4').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('rightLeft', 32, 25, 'left', 1.32, 1.5, true);
    });
  }
}

const editorScreen = new EditorScreen();
editorScreen.initialize();
