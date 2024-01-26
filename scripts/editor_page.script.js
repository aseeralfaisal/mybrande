import { fabric } from 'fabric';
import { DeleteLayer } from './layer_remover';
import 'alwan/dist/css/alwan.min.css';
import WebFont from 'webfontloader';
import axios from 'axios';
import { rgbToHex, convertRGBtoHex, hexToHsl, hexToRgb, rgbaToHex } from './color_converter';
import { rotateReset } from './rotate_reset';
import { saveCanvas } from './save_canvas';
import { logoRenderer } from './logo_renderer';
import { onSelect } from './on_select';
import { scaleLogo, setlogoPosition } from './set_logo_position';
import { handleCaseListClick } from './case_list_event';
import { iroColorChange, iroColorPicker } from './color_picker';
import { redo, undo } from './undo_redo';
import { logoElementEvent } from './logo_element_event';
import { sloganELementEvent } from './slogan_element_event';
import { generateCustomColor } from './generate_custom_color';
import { logoPalleteEvent } from './logo_pallete_event';
import { bgPalleteEvent } from './bg_pallete_event';
import { solidColorMainEvent } from './solid_main_event';
import { setCanvasBackground } from './miscellaneous';
import { toastNotification } from './toast_notification';

export const querySelect = (element) => document.querySelector(element);
export const querySelectAll = (element) => document.querySelectorAll(element);
export const getAttr = (element, attr) => querySelect(element).getAttribute(attr);

const families = ['Poppins:300,400,500,600,700', 'Inter:300,400,500,600,700', 'Roboto:400,500,700']
WebFont.load({
  google: { families },
  fontloading: () => (querySelect('#loader').style.display = 'flex'),
  fontactive: (familyName) => {
    if (familyName === 'Poppins' || familyName === 'Inter' || familyName === 'Roboto') {
      querySelect('#loader').style.display = 'none';
    }
  },
});

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
    this.urlParams = new URLSearchParams(document.location.search);
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
    this.alignId = 1;

    querySelect("#logoMainField").addEventListener('input', (e) => {
      const val = e.target.value;
      params.set('logo', val);
      const updatedURL = url.origin + url.pathname + "?" + params.toString();
      history.pushState({}, '', updatedURL);
    })

    querySelect("#sloganNameField").addEventListener('input', (e) => {
      const val = e.target.value;
      params.set('slogan', val);
      const updatedURL = url.origin + url.pathname + "?" + params.toString();
      history.pushState({}, '', updatedURL);
    });


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
      rotateReset(active);
      this.canvas.renderAll();
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

    setCanvasBackground(this.canvas);

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

    this.caseListTitle.addEventListener('click', () => {
      if (this.caseList.classList.contains('show')) {
        this.caseList.classList.remove('show');
      } else {
        this.caseList.classList.add('show');
      }

      [fontList, fontStyleList].forEach((i) => i.classList.remove('show'));
    });

    this.caseList.addEventListener('click', (event) => handleCaseListClick.call(this, event));

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
      // const getFormattedBgColor = (bgColor) => {
      //   if (typeof bgColor === 'object') {
      //     const color = bgColor?.colorStops.map((i) => i.color);
      //     return color?.join(',');
      //   }
      //   return bgColor;
      // };
      // const bgColor = this.canvasBG
      // const logo_backgroundcolor = bgColor === "#efefef" ? 'transparent' : getFormattedBgColor(bgColor);

      if (!this.canvasBG || !logoNameElement || !sloganNameElement || !this.alignId) {
        return toastNotification("Data Error")
      }

      const logoId = querySelect("#logo_id")?.value;
      saveCanvas(logoId, this.canvas, this.canvasBG, logoNameElement, sloganNameElement, this.alignId)
    });

    querySelect('#third_page_btn').addEventListener('click', () => {
      const saveSettings = {
        format: 'jpg',
        multiplier: 1,
      };
      const savedLogo = this.canvas.toDataURL(saveSettings);
      localStorage.setItem('logo-file', savedLogo);
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

    function handleFlipChange(isHorizontal) {
      const active = this.canvas.getActiveObject();
      if (!active) return;

      const currCoordinate = active.getCenterPoint();
      const flipProperty = isHorizontal ? 'flipX' : 'flipY';
      const isFlip = isHorizontal ? 'isFlipX' : 'isFlipY';

      this[isFlip] = !this[isFlip];
      active.set(flipProperty, this[isFlip]);

      active.setPositionByOrigin(new fabric.Point(currCoordinate.x, currCoordinate.y), 'center', 'center');
      active.setCoords();

      this.canvas.renderAll();
      updatePreview();
    }

    this.flipHorizontal.addEventListener('change', () => {
      handleFlipChange.call(this, true);
    });

    this.flipVertical.addEventListener('change', () => {
      handleFlipChange.call(this, false);
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
    let pickerDefaultColor = '#ffffff';
    let colorPicker = iroColorPicker('#open_picker', openPickerView, pickerDefaultColor, 210, 20)

    this.canvas.on('selection:created', onSelect(this.canvas, this.activeLayerIndex));
    this.canvas.on('selection:updated', onSelect(this.canvas, this.activeLayerIndex));
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

    var logoNameElement = textMain({ text: this.logoName });
    var sloganNameElement = textMain({ text: this.sloganName });

    if (this.logoFile) {
      logoRenderer(this.canvas, this.logoFile, logoNameElement, sloganNameElement, logoLayerGroup,
        this.layers, this.initialRotation, this.activeNavbarSetting, this.updateActiveNavbar,
        this.logoSettingsContainer, this.textSettingsContainer, this.backgroundSettingsContainer, this.isFlipX, this.isFlipY, isLogoShadowAdjust, rgbToHex, colorPicker)
    }

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

    const colorPickerText = iroColorPicker('#open_picker_text', openTextPickerView, pickerDefaultColor);

    logoNameElement.on('mousedown', (e) => {
      e.e.preventDefault();
      this.textSelectorValue = 'LogoName';
      logoElementEvent(hasShadow, logoNameElement)
      captureCanvasState();
      this.canvas.requestRenderAll();

      this.activeNavbarSetting = 'text';
      this.updateActiveNavbar();
    });

    sloganNameElement.on('mousedown', (e) => {
      e.e.preventDefault();
      this.textSelectorValue = 'SloganName';
      sloganELementEvent(hasShadow, sloganNameElement)
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
    querySelect('#undo-btn').addEventListener('click', undo);
    querySelect('#redo-btn').addEventListener('click', redo);

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'z') {
        undo(currIndex, this.canvas, captureCanvasState, undoHistory, logoNameElement, sloganNameElement);
      }

      if (e.ctrlKey && e.key === 'y') {
        redo(currIndex, this.canvas, captureCanvasState, undoHistory, logoNameElement, sloganNameElement);
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

    querySelect('#copyElement-uploads').addEventListener('click', () => {
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
    palleteComponent.addEventListener('colorChange', (e) => bgPalleteEvent(e, this.canvas));

    const logoPalleteComponent = querySelect('#logo-pallete');
    logoPalleteComponent.addEventListener('colorChange', (e) => logoPalleteEvent(e, this.canvas));

    const textPalleteComponent = querySelect('#text-pallete');
    textPalleteComponent.addEventListener('colorChange', (e) => textPalleteComponent(e, this.canvas));

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
      setCanvasBackground(this.canvas);
      this.canvas.setBackgroundColor(this.canvasBG, this.canvas.renderAll.bind(this.canvas));
      querySelect('.preview-modal-bg').style.display = 'none';
    });

    querySelect('#overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('overlay')) {
        setCanvasBackground(this.canvas);
        this.canvas.setBackgroundColor('#eee', this.canvas.renderAll.bind(this.canvas));
        querySelect('.preview-modal-bg').style.display = 'none';
      }
    });

    querySelect('#icon-search-input').addEventListener('input', (event) => {
      const textInput = event.target.value;
      querySelectAll('#clip-icon').forEach((icon) => {
        const iconCategoryTitle = icon.getAttribute('data-name');
        if (!iconCategoryTitle.toLowerCase().includes(textInput.toLowerCase())) {
          icon.style.display = 'none';
        } else {
          icon.style.display = 'grid';
        }
      });
    });

    querySelect('.popup').addEventListener('click', (e) => {
      if (e.target.classList.contains('popup')) {
        querySelect('#popup-parent').style.display = 'none';
        querySelect('#popup-parent-icons').style.display = 'none';
      }
    });

    document.getElementById('close-btn').addEventListener('click', () => {
      querySelect('#popup-parent-icons').style.display = 'none';
    });

    function svgCreator(icon, name = '') {
      const img = new Image();
      img.classList.add('clip-icon');
      img.setAttribute('id', 'clip-icon');
      img.setAttribute('data-name', name);
      const blob = new Blob([icon], { type: 'image/svg+xml' });
      const svgDataUrl = URL.createObjectURL(blob);
      img.src = svgDataUrl;
      img.style.width = '80px';
      img.style.height = '80px'
      img.style.objectFit = 'cover'
      return img;
    }

    const iconUrl = "https://www.mybrande.com/api/all/icons";
    let currIconIndex = 0, iconList;
    axios.get(iconUrl)
      .then(resp => {
        iconList = resp.data.CategoryWiseIcon;

        iconList.forEach((icon, index) => {
          let iconItem = icon.Icons[currIconIndex].icon_svg;
          const name = icon.category.iconcategory_name;
          const categoryTitle = querySelect("#category_type_title")
          const span = document.createElement('span');
          span.setAttribute('index', index);
          span.classList.add('search-icon-category-text');
          span.innerText = name;
          categoryTitle.append(span);
          const svgImg = svgCreator(iconItem, name);
          querySelect('#clip-icons').appendChild(svgImg);
        });
      })
      .catch(error => {
        console.error("Error fetching icons:", error);
      });

    querySelect("#category_type_title")
      .addEventListener('click', (e) => {
        querySelect('#clip-icons').innerHTML = null;
        const index = e.target.getAttribute('index');
        const currIndexIcons = iconList[index].Icons;
        currIndexIcons.forEach(icon => {
          const name = icon.iconcategory_name;
          const svgImg = svgCreator(icon.icon_svg, name);
          querySelect('#clip-icons').appendChild(svgImg);
        })
      })

    querySelect('#clip-icons').addEventListener('click', (e) => {
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
      querySelect('#popup-parent-icons').style.display = 'none';
    });

    querySelect('#add-clip-text').addEventListener('click', () => {
      querySelect('#popup-parent').style.display = 'block';
      querySelect('#popup-parent-icons').style.display = 'none';
    });

    querySelect("#add-icon").addEventListener('click', () => {
      querySelect('#popup-parent').style.display = 'block';
      querySelect("#popup-parent-icons").style.display = "block"
    })

    querySelect('.item-title').addEventListener('click', () => {
      const IText = new fabric.IText('Add Text', { fontFamily: 'Poppins' });
      this.canvas.add(IText);
      IText.center();
      IText.set('left', IText.top + 50);
      updatePreview();
      this.canvas.requestRenderAll();
      this.canvas.setActiveObject(IText);
      querySelect('#popup-parent').style.display = 'none';
      querySelect('#popup-parent-icons').style.display = 'none';
    });

    var isLogoShadowAdjust = false;
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

      canvasObjects.forEach((item) => {
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
      iroColorChange(color, colorChanging, pickerDefaultColor, this.canvas);
      updateColorPickers();
    });

    function changeColorOnInput(items, mode = 'rgb') {
      return items.forEach((id) => {
        querySelect(id).addEventListener('input', () => {
          let r = querySelect(id).value;
          let g = querySelect(id).value;
          let b = querySelect(id).value;
          mode === 'rgb' ? colorPicker.color.rgb = { r, g, b } : colorPicker.color.hsl = { h, s, l };
          const a = this.canvas.getActiveObject();
          a.set('fill', colorPicker.color.hexString);
          this.canvas.requestRenderAll();
        });
      });

    }

    changeColorOnInput(['#R', '#G', '#B'], 'rgb')
    changeColorOnInput(['#R2', '#G2', '#B2'], 'rgb')
    changeColorOnInput(['#H', '#S', '#L'], 'hsl')
    changeColorOnInput(['#H2', '#S2', '#L2'], 'hsl')

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
    let pickerDefaultColorBG = '#ffffff';
    let colorPickerBG = iroColorPicker('#openTextPickerViewBG', openPickerViewBG,
      pickerDefaultColorBG);

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

    querySelect('#custom_text_color_generator').addEventListener('change', e => {
      const HEX = "#HEX2";
      const R = "#R2";
      const G = "#G2";
      const B = "#B2"
      const H = "#H";
      const S = "#S";
      const L = "#L";
      const wrapper = '#custom_text_colors_wrapper';

      generateCustomColor({ e, HEX, R, G, B, H, S, L, wrapper, canvas: this.canvas });
      this.canvas.renderAll();
      updatePreview();
    });

    querySelect('#custom_bg_color_generator').addEventListener('change', (e) => {
      const HEX = "#HEX_BG";
      const R = "#R_BG";
      const G = "#G_BG";
      const B = "#B_BG"
      const H = "#H_BG";
      const S = "#S_BG";
      const L = "#L_BG";
      const wrapper = '#custom_bg_colors_wrapper';

      generateCustomColor({ e, HEX, R, G, B, H, S, L, wrapper, canvas: this.canvas });
      this.canvas.renderAll();
      updatePreview();
    });

    querySelectAll('#solid_color').forEach((item) => solidColorMainEvent(item, 'solid', colorPicker, this.canvas, updateColorPickers));
    querySelectAll('#solid_color_text').forEach((item) => solidColorMainEvent(item, 'text', colorPickerText, this.canvas, updateColorPickers));
    querySelectAll('#solid_color_bg').forEach((item) => solidColorMainEvent(item, 'bg', null, this.canvas, updateColorPickers));

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
      const updateElement = (element) => {
        const view = querySelect(element + '_view');
        if (!view) return null
        view.classList.remove('color_mode_title-active');
        view.style.display = 'none';
      };

      [element1, element2].forEach(updateElement);

      const activeView = querySelect(activeElement + '_view');
      activeView.classList.add('color_mode_title-active');
      activeView.style.display = 'flex';
    };

    const colorModes = ['HSL', 'RGB', 'HEX'];
    const colorModes2 = ['HSL2', 'RGB2', 'HEX2'];

    colorModes.forEach((mode) => {
      querySelect(`#${mode}_mode`).addEventListener('click', () => {
        handleColorModeClick(`#${mode}`, ...colorModes.filter((m) => m !== mode));
      });
    });

    colorModes2.forEach((mode) => {
      querySelect(`#${mode}_mode`).addEventListener('click', () => {
        handleColorModeClick(`#${mode}`, ...colorModes2.filter((m) => m !== mode));
      });
    });

    handleColorModeClick('#HEX', '#RGB', '#HSL');
    handleColorModeClick('#HEX2', '#RGB2', '#HSL2');

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

    setlogoPosition(1, this.canvas, logoNameElement, sloganNameElement);
    scaleLogo(200, this.canvas)

    async function fetchData(canvas) {
      const logoId = querySelect("#logo_id").value;

      if (!logoId) return toastNotification("Error!! Logo ID Not Found")
      querySelect("#loader2").style.display = "flex";
      const response = await axios.get(`https://www.mybrande.com/api/find/logo/${logoId}`);


      const bg = response.data.AllData.logo_backgroundcolor;
      const logoPosition = response.data.AllData.logo_position;
      const svgData = response.data.AllData.svg_data;
      if (svgData) {
        localStorage.setItem('logo-file', svgData);
        setlogoPosition(logoPosition, canvas, logoNameElement, sloganNameElement);
      }
      return bg
    }

    fetchData(this.canvas).then(bgColor => {
      querySelect("#loader2").style.background = "#ffffff99";
      this.canvas.setBackgroundColor(bgColor);
      this.canvas.renderAll();
      updatePreview();
      querySelect("#loader2").style.display = "none";
    });

    ['top_bottom_1', 'top_bottom_2', 'top_bottom_3', 'top_bottom_4',
      'bottom_top_1', 'bottom_top_2', 'bottom_top_3',
      'left_right_1', "left_right_2", 'left_right_3',
      'left_right_4', 'right_left_1', 'right_left_2',
      'right_left_3', 'right_left_4'].forEach(item => {
        querySelect(`#${item}`).addEventListener('click', () => {
          discardSelectionForAlignments();
          this.alignId = getAttr(item, 'data-align-id');
          // scaleLogo(200);
          // centerAndResizeElements('topBottom', 46, 22, 'center', 1.32, 1.5, this.canvas);
        });
      })
  }
}

const editorScreen = new EditorScreen();
editorScreen.initialize();
