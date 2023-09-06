import { fabric } from 'fabric';
import { CreateLayerSection } from './events/createLayer';
import { DownloadImg } from './events/downloadimg';
import { renderSVGForMug } from './previews/mug.preview';
import { renderSVGForCard } from './previews/card.preview';
import { wallPreview } from './previews/wall.preview';
import { shirtPreview } from './previews/shirt.preview';
import clipIcons from '../assets/icons/clipIcons';
import { DeleteLayer } from './events/handleDeleteLayer';

const $ = (id) => document.querySelector(id);

class EditorScreen {
  constructor() {
    this.canvasBG = '#efefef';
    this.canvas = new fabric.Canvas('c', { backgroundColor: this.canvasBG });
    this.previewCanvas = new fabric.Canvas('preview-canvas', { backgroundImage: '/static/mug.png' });
    this.magnifier = new fabric.Canvas('magnifier', { backgroundColor: this.canvasBG });
    this.textMode = $('.nav-item[data-name="text"]');
    this.logoMode = $('.nav-item[data-name="logo"]');
    this.uploadsMode = $('.nav-item[data-name="uploads"]');
    this.backgroundMode = $('.nav-item[data-name="background"]');
    this.previewMode = $('.nav-item[data-name="preview"]');
    this.galleryMode = $('.nav-item[data-name="gallery"]');
    this.urlParams = new URLSearchParams(document.location.search);
    this.logoName = this.urlParams.get('logo_name');
    this.sloganName = this.urlParams.get('slogan_name');
    this.rotateRange = $('#rotate-bar');
    this.downloadBtn = $('#save-btn');
    this.scaleRange = $('#progress-bar');
    this.scaleRangeUploads = $('#progress-bar-uploads');
    this.scaleElement = $('#scale-value');
    this.flipHorizontal = $('#flip-x');
    this.flipVertical = $('#flip-y');
    this.activeLayerIndex = null;
    this.logoFile = localStorage.getItem('logo-file');
    this.layers = $('#layers');
    this.textLayers = $('#text-layers');
    this.rotateValue = null;
    this.isRotating = false;
    this.scaleValue = 3;
    this.isScaling = null;
    this.isFlipX = false;
    this.isFlipY = false;
    this.textcolorPicker = $('#color-picker');
    this.logoColorPicker = $('#logo-color-picker');
    this.logoColorPicker1 = $('#logo-color-picker1');
    this.logoColorPicker2 = $('#logo-color-picker2');
    this.logoNameInput = $('#logoNameInput');
    this.sloganNameInput = $('#sloganNameInput');
    this.logoSettingsContainer = $('.setting-container');
    this.textSettingsContainer = $('.text-settings-container');
    this.backgroundSettingsContainer = $('.bg-settings-container');
    this.uploadSettingsContainer = $('.uploads-settings-container');
    this.textColorPickerContainer = $('.color-picker-container');
    this.letterSpacingSlider = $('#letter-spacing-slider');
    this.textColorPickerValue = '#eeeeee';
    this.letterSpacing = '0';
    this.textSelector = $('#text-selector');
    this.shadowBlurSlider = $('#shadow-blur-slider');
    this.shadowOffsetXSlider = $('#shadow-offsetX-slider');
    this.shadowOffsetYSlider = $('#shadow-offsetY-slider');
    this.logoShadowOffsetXSlider = $('#logo-shadow-offsetX-slider');
    this.logoShadowOffsetYSlider = $('#logo-shadow-offsetY-slider');
    this.shadowBlur = null;
    this.shadowOffsetX = null;
    this.shadowOffsetY = null;
    this.logoShadowBlur = null;
    this.logoShadowOffsetX = null;
    this.logoShadowOffsetY = null;
    this.textSettingsContainer.style.display = 'none';
    this.canvasZoomLevel = 1;
    this.settingsListTitle = $('.setting-list-item__title');
    this.caseListTitle = $('.case-list-item__title');
    this.fontSizeListTitle = $('.font_size-list-item__title');
    this.fontStyleListTitle = $('.font_style-list-item__title');
    this.settingsList = $('.setting-list-items-li');
    this.fontStyleList = $('.font_style-list-items-li');
    this.fontSizeList = $('.font_size-list-items-li');
    this.caseList = $('.case-list-items-li');
    this.fontSelector = $('.font-selector');
    this.textSelectorValue = 'LogoName';
    this.logoFillColor = null;
    this.zoomSlider = $('#zoom-slider');
    this.colorMode = 'Solid';
    this.activeNavbarSetting = 'logo';

    this.rotateObject = () => {
      const selectedObject = this.canvas.getActiveObject();
      if (this.isRotating && selectedObject && this.rotateValue) {
        selectedObject.rotate(this.rotateValue);
        this.canvas.requestRenderAll();
      }
      this.isRotating = false;
    };

    this.scaleObject = () => {
      const selectedObject = this.canvas.getActiveObject();
      if (this.isScaling && selectedObject && this.scaleValue) {
        selectedObject.scale(this.scaleValue);
        this.canvas.requestRenderAll();
      }
      this.isScaling = false;
    };

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
  }

  initialize() {
    this.updateActiveNavbar = () => {
      document.querySelectorAll('.nav-item').forEach((item) => {
        if (this.activeNavbarSetting.includes(item.innerText.toLowerCase())) {
          item.style.backgroundColor = 'var(--gold-darker)';
        } else {
          item.style.backgroundColor = 'var(--gold)';
        }
      });
    };
    this.updateActiveNavbar();

    this.settingsListTitle.addEventListener('click', () => {
      if (this.settingsList.classList.contains('show')) {
        this.settingsList.classList.remove('show');
      } else {
        this.settingsList.classList.add('show');
      }
    });

    this.caseListTitle.addEventListener('click', () => {
      if (this.caseList.classList.contains('show')) {
        this.caseList.classList.remove('show');
      } else {
        this.caseList.classList.add('show');
      }
    });

    if (this.textSelectorValue === 'LogoName') {
      this.sloganNameInput.style.display = 'none';
      this.logoNameInput.style.display = 'block';
    } else if (this.textSelectorValue === 'LogoName') {
      this.logoNameInput.style.display = 'none';
      this.sloganNameInput.style.display = 'block';
    }

    this.settingsList.addEventListener('click', (ev) => {
      const selectedTextElement = ev.target.innerText;
      if (selectedTextElement === 'Slogan Name') {
        this.textSelectorValue = 'SloganName';
        this.logoNameInput.style.display = 'none';
        this.sloganNameInput.style.display = 'block';
      } else {
        this.textSelectorValue = 'LogoName';
        this.sloganNameInput.style.display = 'none';
        this.logoNameInput.style.display = 'block';
      }
      this.settingsListTitle.innerText = selectedTextElement;
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-angle-down';
      this.settingsListTitle.append(icon);
      this.settingsList.classList.remove('show');
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

    this.caseList.addEventListener('click', (ev) => {
      const selectedTextElement = ev.target.innerText;

      const active = this.canvas.getActiveObject();
      const text = active.text;
      if (selectedTextElement === 'Uppercase') {
        active.text = text.toUpperCase();
      } else if (selectedTextElement === 'Lowercase') {
        active.text = text.toLowerCase();
      } else if (selectedTextElement === 'Title Case') {
        active.text = toTitleCase(text);
      } else if (selectedTextElement === 'Sentence Case') {
        active.text = toSentenceCase(text);
      }

      this.caseListTitle.innerText = selectedTextElement;
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-angle-down';
      this.caseListTitle.append(icon);
      this.caseList.classList.remove('show');
      this.canvas.requestRenderAll();
    });

    this.fontStyleList.addEventListener('click', (ev) => {
      const selectedTextElement = ev.target.innerText;

      const active = this.canvas.getActiveObject();
      if (selectedTextElement === 'Normal') {
        active.set('fontStyle', 'normal');
      } else if (selectedTextElement === 'Italic') {
        active.set('fontStyle', 'italic');
      } else {
        active.set('underline', true);
      }

      this.fontStyleListTitle.innerText = selectedTextElement;
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-angle-down';
      this.fontStyleListTitle.append(icon);
      this.fontStyleList.classList.remove('show');
      this.canvas.requestRenderAll();
    });

    this.fontSizeList.addEventListener('click', (event) => {
      const text = event.target.innerText;
      const fontSize = text.split(' ')[0];

      const active = this.canvas.getActiveObject();
      active.fontSize = fontSize;

      this.fontSizeListTitle.innerText = fontSize + ' px';
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-angle-down';
      this.fontSizeListTitle.append(icon);
      this.fontSizeList.classList.remove('show');
      this.canvas.requestRenderAll();
    });

    this.rotateRange.addEventListener('input', (e) => {
      this.isRotating = true;
      this.rotateValue = parseInt(e.target.value, 10);
      this.rotateObject();
    });

    $('#rotate-bar-uploads').addEventListener('input', (e) => {
      this.isRotating = true;
      this.rotateValue = parseInt(e.target.value, 10);
      this.rotateObject();
    });

    this.downloadBtn.addEventListener('click', () => {
      const savedLogo = this.canvas.toDataURL({
        format: 'png',
        multiplier: 3,
      });
      localStorage.setItem('saved_logo', savedLogo);
      location.href = '../../details.html'
    });

    this.scaleElement.textContent = this.scaleValue;
    this.scaleRange.addEventListener('input', (e) => {
      if (this.isScaling <= 10) this.isScaling = true;
      this.scaleElement.textContent = this.scaleValue;
      this.scaleValue = parseFloat(e.target.value, 10) / 10;
      this.scaleObject();
    });

    this.scaleRangeUploads.addEventListener('input', (e) => {
      if (this.isScaling <= 10) this.isScaling = true;
      this.scaleElement.textContent = this.scaleValue;
      this.scaleValue = parseFloat(e.target.value, 10) / 10;
      this.scaleObject();
    });

    this.flipHorizontal.addEventListener('change', () => {
      this.isFlipX = !this.isFlipX;
      const selectedObject = this.canvas.getActiveObject();
      selectedObject.set('flipX', this.isFlipX);
      this.canvas.requestRenderAll();
    });

    $('#flip-x-uploads').addEventListener('change', () => {
      this.isFlipX = !this.isFlipX;
      const selectedObject = this.canvas.getActiveObject();
      selectedObject.set('flipX', this.isFlipX);
      this.canvas.requestRenderAll();
    });

    this.flipVertical.addEventListener('change', () => {
      this.isFlipY = !this.isFlipY;
      const selectedObject = this.canvas.getActiveObject();
      selectedObject.set('flipY', this.isFlipY);
      this.canvas.requestRenderAll();
    });

    $('#flip-y-uploads').addEventListener('change', () => {
      this.isFlipY = !this.isFlipY;
      const selectedObject = this.canvas.getActiveObject();
      selectedObject.set('flipY', this.isFlipY);
      this.canvas.requestRenderAll();
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

    const updatePreview = () => {
      const imageURL = this.canvas.toDataURL({
        format: 'png',
        multiplier: 0.5,
      });
      document.getElementById('magnifier_img').src = imageURL;
    };

    const onSelect = () => {
      const activeObject = this.canvas.getActiveObject();
      this.activeLayerIndex = this.canvas.getObjects().indexOf(activeObject);

      if (activeObject) {
        const layers = document.querySelectorAll('.layer-container');
        layers.forEach((layer, idx) => {
          const layerImg = layer.querySelector('.layer-img');
          const layerSpan = layer.querySelector('.layer-span');
          if (idx == this.activeLayerIndex) {
            layerImg.classList.add('selected');
            layerSpan.classList.add('selected');
          } else {
            layerImg.classList.remove('selected');
            layerSpan.classList.remove('selected');
          }
        });
      }
      this.canvas.renderAll();
    };

    this.canvas.on('selection:created', onSelect);
    this.canvas.on('selection:updated', onSelect);

    const textMain = ({ text, fontFamily = 'Poppins', fontSize = 32, fill = '#000' }) => {
      return new fabric.Text(text, { fontFamily, fontSize, fill, selectable: true, hasRotatingPoint: true });
    };

    const logoNameElement = textMain({ text: this.logoName });
    const sloganNameElement = textMain({ text: this.sloganName, fontSize: 24 });

    if (this.logoFile) {
      fabric.loadSVGFromString(this.logoFile, (objects, options) => {
        const layerGroup = fabric.util.groupSVGElements(objects, options);
        objects.forEach((obj, idx) => {
          this.canvas.add(obj);
          const layerSection = new CreateLayerSection(this.layers);
          layerSection.create(obj, idx);

          obj.on('mousedown', () => {
            this.activeNavbarSetting = 'logo';
            this.updateActiveNavbar();
            this.logoSettingsContainer.style.display = 'grid';
            this.textSettingsContainer.style.display = 'none';
            this.backgroundSettingsContainer.style.display = 'none';
            this.uploadSettingsContainer.style.display = 'none';
            this.canvas.requestRenderAll();
          });
        });

        const originalWidth = layerGroup.width;
        const originalHeight = layerGroup.height;
        const scaleFactor = Math.min(250 / originalWidth, 250 / originalHeight);
        layerGroup.scale(scaleFactor);
        this.canvas.centerObject(layerGroup);
        this.canvas.viewportCenterObject(layerGroup);
        if (layerGroup) {
          layerGroup.height = 350;
          layerGroup.ungroupOnCanvas();
        }
        this.canvas.requestRenderAll();
      });

      this.canvas.add(logoNameElement);
      this.canvas.add(sloganNameElement);
      logoNameElement.viewportCenter();
      sloganNameElement.viewportCenter();
      logoNameElement.set('top', (logoNameElement.top += 70));
      sloganNameElement.set('top', (sloganNameElement.top += 110));
      this.canvas.setActiveObject(logoNameElement);
      this.canvas.setActiveObject(sloganNameElement);
      this.canvas.discardActiveObject(logoNameElement);
      this.canvas.discardActiveObject(sloganNameElement);
      this.canvas.requestRenderAll();
    }

    function getTextCase(text) {
      if (text === text.toUpperCase()) {
        return 'Uppercase';
      } else if (text === text.toLowerCase()) {
        return 'Lowercase';
      } else if (text === text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()) {
        return 'Title Case';
      } else {
        return 'Sentence Case';
      }
    }

    const putAngleDownIcon = (className) => {
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-angle-down';
      $(className).append(icon);
    };

    logoNameElement.on('mousedown', (event) => {
      event.e.preventDefault();
      const currentObjColor = logoNameElement.get('fill');
      const textColorPalette = $('#text-pallete').querySelector('.color-palette-gradient');

      if (typeof currentObjColor === 'string') {
        textColorPalette.style.background = currentObjColor;
        // textColorPalette?.querySelector('#grad-solid').style?.background = currentObjColor;
      } else if (currentObjColor && currentObjColor.type === 'radial') {
        const gradientColors = convertFabricColorsToRGB(currentObjColor);
        const gradientStyle = `linear-gradient(0, ${gradientColors.join(', ')})`;
        textColorPalette.style.background = gradientStyle;
        textColorPalette.querySelector('#grad-1').value = gradientStyle;
        textColorPalette.querySelector('#grad-2').value = gradientStyle;
        textColorPalette.querySelector('#grad-solid').value = gradientStyle;
      }

      $('.font_style-list-item__title').innerText = logoNameElement.fontStyle;
      putAngleDownIcon('.font_style-list-item__title');

      const letterSpacing = +logoNameElement.charSpacing;
      $('#letter-spacing-slider').value = letterSpacing;
      const fontFamily = logoNameElement.fontFamily;
      $('#font-selector-title').innerText = fontFamily;
      putAngleDownIcon('#font-selector-title');
      const logoText = logoNameElement.text;
      $('.case-list-item__title').innerText = getTextCase(logoText);
      putAngleDownIcon('.case-list-item__title');
      this.canvas.requestRenderAll();
    });

    sloganNameElement.on('mousedown', (event) => {
      event.e.preventDefault();
      const currentObjColor = sloganNameElement.get('fill');
      const textColorPalette = $('#text-pallete').querySelector('.color-palette-gradient');

      if (typeof currentObjColor === 'string') {
        textColorPalette.style.background = currentObjColor;
        // textColorPalette.querySelector('#grad-solid').style?.background = currentObjColor;
      } else if (currentObjColor && currentObjColor.type === 'radial') {
        const gradientColors = convertFabricColorsToRGB(currentObjColor);
        const gradientStyle = `linear-gradient(0, ${gradientColors.join(', ')})`;
        textColorPalette.style.background = gradientStyle;
        textColorPalette.querySelector('#grad-1').value = gradientStyle;
        textColorPalette.querySelector('#grad-2').value = gradientStyle;
        textColorPalette.querySelector('#grad-solid').value = gradientStyle;
      }

      $('.font_style-list-item__title').innerText = sloganNameElement.fontStyle;
      putAngleDownIcon('.font_style-list-item__title');

      const letterSpacing = +sloganNameElement.charSpacing;
      $('#letter-spacing-slider').value = letterSpacing;
      const fontFamily = sloganNameElement.fontFamily;
      $('#font-selector-title').innerText = fontFamily;
      putAngleDownIcon('#font-selector-title');
      const logoText = sloganNameElement.text;
      $('.case-list-item__title').innerText = getTextCase(logoText);
      putAngleDownIcon('.case-list-item__title');
    });

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

    logoNameElement.on('mousedown', () => {
      this.fontSizeListTitle.innerText = logoNameElement.fontSize + ' px';
      this.activeNavbarSetting = 'text';
      this.updateActiveNavbar();
      this.logoSettingsContainer.style.display = 'none';
      this.textSettingsContainer.style.display = 'grid';
      this.backgroundSettingsContainer.style.display = 'none';
      this.uploadSettingsContainer.style.display = 'none';
      putAngleDownIcon('.font_size-list-item__title');
      this.canvas.requestRenderAll();

      this.textSelectorValue = 'LogoName';
      this.settingsListTitle.textContent = 'Logo Name';
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-angle-down';
      this.settingsListTitle.append(icon);
      this.sloganNameInput.style.display = 'none';
      this.logoNameInput.style.display = 'block';
    });
    fabric.CurvedText = fabric.util.createClass(fabric.Object, {
      type: 'curved-text',
    });

    sloganNameElement.on('mousedown', () => {
      this.fontSizeListTitle.innerText = sloganNameElement.fontSize + ' px';
      this.activeNavbarSetting = 'text';
      this.updateActiveNavbar();
      this.logoSettingsContainer.style.display = 'none';
      this.textSettingsContainer.style.display = 'grid';
      this.backgroundSettingsContainer.style.display = 'none';
      this.uploadSettingsContainer.style.display = 'none';
      putAngleDownIcon('.font_size-list-item__title');
      this.canvas.requestRenderAll();

      this.textSelectorValue = 'SloganName';
      this.settingsListTitle.textContent = 'Slogan Name';
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-angle-down';
      this.settingsListTitle.append(icon);
      this.logoNameInput.style.display = 'none';
      this.sloganNameInput.style.display = 'block';
    });

    this.logoNameInput.addEventListener('input', (e) => {
      logoNameElement.set('text', e.target.value);
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set('logo_name', e.target.value);
      localStorage.setItem('logo_name', e.target.value);
      logoNameElement.centerH();
      updatePreview();
      this.canvas.requestRenderAll();
    });

    this.sloganNameInput.addEventListener('input', (e) => {
      sloganNameElement.set('text', e.target.value);
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set('slogan_name', e.target.value);
      localStorage.setItem('slogan_name', e.target.value);
      sloganNameElement.centerH();
      updatePreview();
      this.canvas.renderAll();
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
    // this.galleryMode.addEventListener('mouseover', () => onMouseOver(true, this.galleryMode));
    // this.galleryMode.addEventListener('mouseleave', () => onMouseOver(false, this.galleryMode));
    this.previewMode.addEventListener('mouseover', () => onMouseOver(true, this.previewMode));
    this.previewMode.addEventListener('mouseleave', () => onMouseOver(false, this.previewMode));
    // this.uploadsMode.addEventListener('mouseover', () => onMouseOver(true, this.uploadsMode));
    // this.uploadsMode.addEventListener('mouseleave', () => onMouseOver(false, this.uploadsMode));

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

    // this.galleryMode.addEventListener('click', () => {
    //   this.activeNavbarSetting = 'gallery';
    //   this.logoSettingsContainer.style.display = 'none';
    //   this.textSettingsContainer.style.display = 'none';
    //   this.uploadSettingsContainer.style.display = 'none';
    //   this.backgroundSettingsContainer.style.display = 'none';
    //   this.updateActiveNavbar();
    // });

    // this.uploadsMode.addEventListener('click', () => {
    //   this.activeNavbarSetting = 'uploads';
    //   this.uploadSettingsContainer.style.display = 'grid';
    //   this.backgroundSettingsContainer.style.display = 'none';
    //   this.logoSettingsContainer.style.display = 'none';
    //   this.textSettingsContainer.style.display = 'none';
    //   this.updateActiveNavbar();
    // });

    this.backgroundMode.addEventListener('click', () => {
      this.activeNavbarSetting = 'background';
      this.backgroundSettingsContainer.style.display = 'none';
      this.logoSettingsContainer.style.display = 'none';
      this.textSettingsContainer.style.display = 'none';
      this.backgroundSettingsContainer.style.display = 'grid';
      this.uploadSettingsContainer.style.display = 'none';
      this.updateActiveNavbar();
    });

    this.previewMode.addEventListener('click', () => {
      this.activeNavbarSetting = 'preview';
      document.querySelector('.preview-modal-bg').style.display = 'block';
      document.querySelector('#right-arrow').click();
    });

    const letterSpacingEvent = (e) => {
      this.letterSpacing = e.target.value;
      const element = this.textSelectorValue === 'SloganName' ? sloganNameElement : logoNameElement;
      element.set('charSpacing', this.letterSpacing);
      this.canvas.requestRenderAll();
    };
    this.letterSpacingSlider.addEventListener('input', letterSpacingEvent);

    this.shadowBlurSlider.addEventListener('input', (e) => {
      this.shadowBlur = e.target.value;
      this.shadowChanger(sloganNameElement, logoNameElement);
      this.canvas.requestRenderAll();
    });

    $('#align-btn').addEventListener('click', () => {
      const active = this.canvas.getActiveObject();
      if (typeof active?.text === 'string') {
        active.centerH();
      }
    });

    $('#logo-shadow-blur-slider').addEventListener('input', (e) => {
      this.logoShadowBlur = e.target.value;
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

    this.shadowOffsetXSlider.addEventListener('input', (e) => {
      this.shadowOffsetX = e.target.value;
      this.shadowChanger(sloganNameElement, logoNameElement);
      this.canvas.requestRenderAll();
    });

    this.logoShadowOffsetXSlider.addEventListener('input', (e) => {
      this.logoShadowOffsetX = e.target.value;
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
      this.shadowOffsetY = e.target.value;
      this.shadowChanger(sloganNameElement, logoNameElement);
      this.canvas.requestRenderAll();
    });

    this.logoShadowOffsetYSlider.addEventListener('input', (e) => {
      this.logoShadowOffsetY = e.target.value;
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

    const fontList = document.querySelector('.font-selector-list');
    const fontSelectorTitle = document.querySelector('.font-selector-title');

    fontSelectorTitle.addEventListener('click', () => {
      if (fontList.classList.contains('show')) {
        fontList.classList.remove('show');
      } else {
        fontList.classList.add('show');
      }
    });

    this.fontStyleListTitle.addEventListener('click', () => {
      if (this.fontStyleList.classList.contains('show')) {
        this.fontStyleList.classList.remove('show');
      } else {
        this.fontStyleList.classList.add('show');
      }
    });

    for (let i = 8; i <= 80; i++) {
      document.querySelector('.font_size-list-items-li');
      const li = document.createElement('li');
      li.append(i + ' px');
      this.fontSizeList.append(li);
    }

    this.fontSizeListTitle.addEventListener('click', () => {
      if (this.fontSizeList.classList.contains('show')) {
        this.fontSizeList.classList.remove('show');
      } else {
        this.fontSizeList.classList.add('show');
      }
    });

    $('#upload-file').addEventListener('input', (e) => {
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
      let element = this.textSelectorValue === 'SloganName' ? sloganNameElement : logoNameElement;
      switch (fontValue) {
        case 'Inter':
          element.set('fontFamily', 'Inter');
          break;
        case 'Roboto':
          element.set('fontFamily', 'Roboto');
          break;
        default:
          element.set('fontFamily', 'Poppins');
          break;
      }
      const title = this.fontSelector.querySelector('.font-selector-title');
      title.textContent = fontValue;
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-angle-down';
      title.append(icon);
      fontList.classList.remove('show');
      this.canvas.requestRenderAll();
    });

    this.canvas.on('object:added', updatePreview);
    this.canvas.on('object:removed', updatePreview);
    this.canvas.on('object:modified', updatePreview);
    this.canvas.on('object:moving', updatePreview);

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

    const undoHistory = [];
    let currIndex = undoHistory.length - 1;
    let captureTimeout = null;

    const captureCanvasState = () => {
      clearTimeout(captureTimeout);

      if (undoHistory.length < 4) {
        captureTimeout = setTimeout(() => {
          undoHistory.push(JSON.stringify(this.canvas.toDatalessJSON()));
          currIndex = undoHistory.length - 1;
        }, 500);
      } else if (undoHistory.length > 10) {
        undoHistory.splice(0, undoHistory.length);
      }
    };

    const undo = () => {
      setCanvasBackground();
      if (currIndex > 0) {
        currIndex -= 1;
        console.log({ currIndex });
        const stateToRestore = JSON.parse(undoHistory[currIndex]);
        this.canvas.clear();
        this.canvas.loadFromJSON(stateToRestore, () => {
          this.canvas.requestRenderAll();
        });
      }
    };

    const redo = () => {
      if (undoHistory.length > 0) {
        setCanvasBackground();
        currIndex += 1;
        console.log({ currIndex });
        const stateToRestore = JSON.parse(undoHistory[currIndex]);
        this.canvas.clear();
        this.canvas.loadFromJSON(stateToRestore, () => {
          this.canvas.requestRenderAll();
        });
      }
    };

    document.getElementById('undo-btn').addEventListener('click', undo);
    document.getElementById('redo-btn').addEventListener('click', redo);

    this.canvas.on('object:modified', captureCanvasState);
    this.canvas.on('object:removed', captureCanvasState);
    this.canvas.on('object:added', captureCanvasState);
    captureCanvasState();

    let localDirFile = null;
    let localDirFiles = null;
    document.onkeydown = (event) => {
      if (event.key === 'Delete') {
        const deleteLayer = new DeleteLayer(event, this.canvas, this.layers, this.activeLayerIndex);
        deleteLayer.deleteLayer();
        localDirFile = null;
      }
    };

    let isMouseOverCanvas = false;

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

    this.canvas.on('mouse:down', (e) => {
      if (e.target) {
        const currentObjColor = e.target.get('fill');
        const colorPalette = $('#color-palette-gradient');

        if (typeof currentObjColor === 'string') {
          colorPalette.style.background = currentObjColor;
          document.querySelector('#grad-solid').value = currentObjColor;
        } else if (currentObjColor && currentObjColor.type === 'radial') {
          const gradientColors = convertFabricColorsToRGB(currentObjColor);
          const gradientStyle = `linear-gradient(0, ${gradientColors.join(', ')})`;
          colorPalette.style.background = gradientStyle;
          document.querySelector('#grad-1').value = gradientStyle;
          document.querySelector('#grad-2').value = gradientStyle;
          document.querySelector('#grad-solid').value = gradientStyle;
        }
        this.canvas.renderAll();
        isMouseOverCanvas = true;
      }
    });

    this.canvas.on('mouse:up', (e) => {
      isMouseOverCanvas = false;
      if (!this.canvas.getActiveObject()) {
        this.canvas.discardActiveObject();
        this.canvas.renderAll();
      }
    });

    // this.canvas.on('object:selected', () => {
    //   isMouseOverCanvas = true;
    // });

    // this.canvas.on('mouse:up', () => {
    //   if (!isMouseOverCanvas) {
    //     this.canvas.discardActiveObject();
    //     this.canvas.renderAll();
    //   }
    // });

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

    $('#copyElement').addEventListener('click', (event) => {
      this.canvas.getActiveObject().clone((cloned) => {
        this.canvas.add(cloned);
        this.canvas.centerObject(cloned);
        this.canvas.requestRenderAll();
      });
    });

    $('#copyElement-uploads').addEventListener('click', (event) => {
      this.canvas.getActiveObject().clone((cloned) => {
        this.canvas.add(cloned);
        this.canvas.centerObject(cloned);
        this.canvas.requestRenderAll();
      });
    });

    let visibilty = true;
    $('#eyeElement').addEventListener('click', () => {
      visibilty = !visibilty;
      this.canvas.getActiveObject().set('visible', visibilty);
      this.canvas.requestRenderAll();
    });

    $('#eyeElement-uploads').addEventListener('click', () => {
      visibilty = !visibilty;
      this.canvas.getActiveObject().set('visible', visibilty);
      this.canvas.requestRenderAll();
    });

    $('#bringUpElement').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.bringForward(selectedObject);
      this.canvas.requestRenderAll();
    });

    $('#bringUpElement-uploads').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.bringForward(selectedObject);
      this.canvas.requestRenderAll();
    });

    $('#bringDownElement').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.sendBackwards(selectedObject);
      this.canvas.requestRenderAll();
    });

    $('#bringDownElement-uploads').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.sendBackwards(selectedObject);
      this.canvas.requestRenderAll();
    });

    const palleteComponent = $('#bg-pallete');
    palleteComponent.addEventListener('colorChange', (e) => {
      const { colorMode, grad1Value, grad2Value, colorAngle, solidValue } = e.detail;

      let angleColor = `${colorAngle}deg`;
      let color = null;
      if (colorMode !== 'Solid') {
        color = new fabric.Gradient({
          type: 'linear',
          coords: {
            x1: 0,
            y1: 0,
            x2: this.canvas.width,
            y2: this.canvas.height,
          },
          colorStops: [
            { offset: 0, color: grad1Value },
            { offset: 1, color: grad2Value },
          ],
        });
      } else {
        color = solidValue;
      }
      this.canvas.backgroundColor = color;
      $(
        '.color-palette-gradient'
      ).style.background = `linear-gradient(${angleColor}, ${grad1Value}, ${grad2Value})`;
      updatePreview();
      this.canvas.requestRenderAll();
    });

    const logoPalleteComponent = $('#logo-pallete');
    logoPalleteComponent.addEventListener('colorChange', (e) => {
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
    });

    const textPalleteComponent = $('#text-pallete');
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
    });

    updatePreview();

    const renderPreview = () => {
      this.previewCanvas.setBackgroundImage(previewPaths[previewIdx], () => {
        // if (previewIdx === 0) {
        //   renderSVGForMug(fabric, this.previewCanvas, this.canvas);
        // } else
        if (previewIdx === 0) {
          // renderSVGForCard(
          //   fabric,
          //   logoNameElement,
          //   sloganNameElement,
          //   this.previewCanvas,
          //   this.logoFile,
          //   25,
          //   65
          // );

          renderSVGForMug(fabric, this.previewCanvas, this.canvas);
        } else if (previewIdx === 1) {
          // wallPreview(fabric, logoNameElement, sloganNameElement, this.previewCanvas, this.logoFile, 0, -165);
          wallPreview(fabric, this.previewCanvas, this.canvas);
        }
        this.previewCanvas.requestRenderAll();
      });
    };

    renderSVGForMug(fabric, this.previewCanvas, this.canvas);

    // const previewPaths = ['/static/mug.png', '/static/card.png', '/static/wall.png'];
    const previewPaths = ['/static/mug.png', '/static/wall.png'];
    let previewIdx = 0;

    document.querySelector('#left-arrow').addEventListener('click', () => {
      this.previewCanvas.clear();
      if (previewIdx < 0) {
        previewIdx = 0;
      } else {
        previewIdx -= 1;
      }
      renderPreview();
    });

    document.querySelector('#right-arrow').addEventListener('click', () => {
      this.previewCanvas.clear();
      if (previewIdx >= previewPaths.length - 1) {
        previewIdx = 0;
      } else {
        previewIdx += 1;
      }
      renderPreview();
    });

    this.canvas.requestRenderAll();

    document.querySelector('#overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('overlay')) {
        document.querySelector('.preview-modal-bg').style.display = 'none';
      }
    });

    $('#icon-search-input').addEventListener('input', (event) => {
      const textInput = event.target.value;
      document.querySelectorAll('#clip-icon').forEach((icon) => {
        if (!icon['name'].toLowerCase().includes(textInput.toLowerCase())) {
          icon.style.display = 'none';
        } else {
          icon.style.display = 'grid';
        }
      });
    });

    // $('#btn-add-clipart-or-text').addEventListener('click', () => {
    //   $('#popup-parent').style.display = 'block';
    // });

    $('.popup').addEventListener('click', (e) => {
      if (e.target.classList.contains('popup')) {
        $('#popup-parent').style.display = 'none';
      }
    });

    document.getElementById('close-btn').addEventListener('click', (e) => {
      console.log(e.target);
      $('#popup-parent-icons').style.display = 'none';
    });

    clipIcons.map((icon) => {
      const svgDataUrl = `data:image/svg+xml;charset=utf-8, ${encodeURIComponent(icon.svg)}`;
      const img = document.createElement('img');
      img.setAttribute('id', 'clip-icon');
      img.classList.add('clip-icon');
      img.setAttribute('name', icon.name);
      img.src = svgDataUrl;
      $('#clip-icons').append(img);
    });

    document.getElementById('clip-icons').addEventListener('click', (e) => {
      const targetSrc = e.target.src;
      const decodedSrc = decodeURIComponent(targetSrc);
      console.log(decodedSrc);

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

    $('#clipart').addEventListener('click', (e) => {
      $('#popup-parent').style.display = 'none';
      $('#popup-parent-icons').style.display = 'block';
    });

    $('.item-title').addEventListener('click', (e) => {
      const IText = new fabric.IText('Add Text', { fontFamily: 'Poppins' });
      this.canvas.add(IText);
      IText.center();
      IText.set('left', IText.top + 50);
      updatePreview();
      this.canvas.requestRenderAll();
      this.canvas.setActiveObject(IText);
      $('#popup-parent').style.display = 'none';
    });

    let isLogoShadowAdjust = false;
    document.getElementById('logo-drop-shadow').addEventListener('change', () => {
      isLogoShadowAdjust = !isLogoShadowAdjust;
      if (isLogoShadowAdjust) {
        $('#logo-shadow-adjust').style.display = 'block';
        const settingsView = $('.settings-view');
        settingsView.scrollTop = settingsView.scrollHeight;
      } else {
        $('#logo-shadow-adjust').style.display = 'none';
        $('#logo-shadow-blur').style.display = 'none';
        $('#logo-shadow-offsetX').style.display = 'none';
        $('#logo-shadow-offsetY').style.display = 'none';
      }
    });

    let isLogoDropShadow = false;
    document.getElementById('logo-shadow-adjust').addEventListener('click', () => {
      isLogoDropShadow = !isLogoDropShadow;
      if (isLogoDropShadow) {
        $('#logo-shadow-blur').style.display = 'block';
        $('#logo-shadow-offsetX').style.display = 'block';
        $('#logo-shadow-offsetY').style.display = 'block';
        const settingsView = $('.settings-view');
        settingsView.scrollTop = settingsView.scrollHeight;
      } else {
        $('#logo-shadow-blur').style.display = 'none';
        $('#logo-shadow-offsetX').style.display = 'none';
        $('#logo-shadow-offsetY').style.display = 'none';
      }
    });

    let isShadowAdjust = false;
    document.getElementById('drop-shadow').addEventListener('change', () => {
      isShadowAdjust = !isShadowAdjust;
      if (isShadowAdjust) {
        $('#shadow-adjust').style.display = 'block';
        const settingsView = $('.settings-view');
        settingsView.scrollTop = settingsView.scrollHeight;
      } else {
        $('#shadow-adjust').style.display = 'none';
        $('#shadow-blur').style.display = 'none';
        $('#shadow-offsetX').style.display = 'none';
        $('#shadow-offsetY').style.display = 'none';
      }
    });

    let isDropShadow = false;
    document.getElementById('shadow-adjust').addEventListener('click', () => {
      isDropShadow = !isDropShadow;
      if (isDropShadow) {
        $('#shadow-blur').style.display = 'block';
        $('#shadow-offsetX').style.display = 'block';
        $('#shadow-offsetY').style.display = 'block';
        const settingsView = $('.settings-view');
        settingsView.scrollTop = settingsView.scrollHeight;
      } else {
        $('#shadow-blur').style.display = 'none';
        $('#shadow-offsetX').style.display = 'none';
        $('#shadow-offsetY').style.display = 'none';
      }
    });

    const centerAndResizeElements = (type, logoSize, sloganSize, textPosition) => {
      (logoNameElement.fontSize = logoSize), sloganSize;
      (sloganNameElement.fontSize = logoSize), sloganSize;

      const logoMain = new fabric.ActiveSelection(
        this.canvas.getObjects().filter((i) => !i.text),
        { canvas: this.canvas }
      );

      const timeout = 5;
      const texts = this.canvas.getObjects().filter((i) => i.text);

      switch (type) {
        case 'topBottom':
          setTimeout(() => {
            logoNameElement.set('top', 360);
            sloganNameElement.set('top', 400);

            logoNameElement.viewportCenterH();
            sloganNameElement.viewportCenterH();

            logoMain.center();
            logoMain.set('top', (logoMain.top -= 40));
          }, timeout);
          break;
        case 'bottomTop':
          setTimeout(() => {
            logoNameElement.set('top', 160);
            sloganNameElement.set('top', 200);

            logoNameElement.viewportCenterH();
            sloganNameElement.viewportCenterH();

            logoMain.center();
            logoMain.set('top', (logoMain.top += 40));
          }, timeout);
          break;
        case 'leftRight':
          setTimeout(() => {
            logoNameElement.center();
            sloganNameElement.center();
            logoNameElement.set('top', 260);
            sloganNameElement.set('top', 300);

            if (textPosition === 'left') {
              logoNameElement.set('left', 520);
              sloganNameElement.set('left', 520);

              logoNameElement.set('textAlign', 'left');
              sloganNameElement.set('textAlign', 'left');
            } else {
              logoNameElement.viewportCenterH();
              sloganNameElement.viewportCenterH();

              logoNameElement.set('left', (logoNameElement.left += 150));
              sloganNameElement.set('left', (sloganNameElement.left += 150));
            }

            logoMain.center();
            logoMain.set('left', (logoMain.left -= 60));
          }, timeout);
          break;
        case 'rightLeft':
          setTimeout(() => {
            logoNameElement.center();
            sloganNameElement.center();

            logoNameElement.set('top', 260);
            sloganNameElement.set('top', 300);

            if (textPosition === 'left') {
              logoNameElement.set('left', 200);
              sloganNameElement.set('left', 200);

              logoNameElement.set('textAlign', 'right');
              sloganNameElement.set('textAlign', 'right');
            } else {
              logoNameElement.viewportCenterH();
              sloganNameElement.viewportCenterH();

              logoNameElement.set('left', (logoNameElement.left -= 150));
              sloganNameElement.set('left', (sloganNameElement.left -= 150));
            }

            logoMain.center();
            logoMain.set('left', (logoMain.left += 60));
          }, timeout);
          break;
      }
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

      selection.centerH();
      this.canvas.setActiveObject(selection);
      this.canvas.discardActiveObject(selection);
      this.canvas.requestRenderAll();
    };

    $('#top_bottom_1').addEventListener('click', () => {
      scaleLogo(180);
      centerAndResizeElements('topBottom', 29, 23);
    });

    $('#top_bottom_2').addEventListener('click', () => {
      scaleLogo(150);
      centerAndResizeElements('topBottom', 26, 21);
    });

    $('#top_bottom_3').addEventListener('click', () => {
      scaleLogo(180);
      centerAndResizeElements('topBottom', 29, 23);
    });

    $('#bottom_top_1').addEventListener('click', () => {
      scaleLogo(180);
      centerAndResizeElements('bottomTop', 32, 25);
    });

    $('#bottom_top_2').addEventListener('click', () => {
      scaleLogo(150);
      centerAndResizeElements('bottomTop', 26, 21);
    });

    $('#bottom_top_3').addEventListener('click', () => {
      scaleLogo(180);
      centerAndResizeElements('bottomTop', 29, 23);
    });

    $('#left_right_1').addEventListener('click', () => {
      scaleLogo(180);
      centerAndResizeElements('leftRight', 32, 25);
    });

    $('#left_right_2').addEventListener('click', () => {
      scaleLogo(180);
      centerAndResizeElements('leftRight', 32, 25, 'left');
    });

    $('#left_right_3').addEventListener('click', () => {
      scaleLogo(150);
      centerAndResizeElements('leftRight', 32, 25, 'center');
    });

    $('#right_left_1').addEventListener('click', () => {
      console.log('right_left_1');
      scaleLogo(180);
      centerAndResizeElements('rightLeft', 32, 25, 'center');
    });

    $('#right_left_2').addEventListener('click', () => {
      scaleLogo(180);
      centerAndResizeElements('rightLeft', 32, 25, 'left');
    });

    $('#right_left_3').addEventListener('click', () => {
      scaleLogo(150);
      centerAndResizeElements('rightLeft', 32, 25, 'left');
    });

    this.canvas.requestRenderAll();
  }
}

const editorScreen = new EditorScreen();
editorScreen.initialize();
