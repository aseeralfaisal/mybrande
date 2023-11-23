import { fabric } from 'fabric';
import { CreateLayerSection } from './createLayer';
import clipIcons from './assets/icons/clipIcons';
import { DeleteLayer } from './handleDeleteLayer';
import 'alwan/dist/css/alwan.min.css';
import iro from '@jaames/iro';

const $ = (id) => document.querySelector(id);

class EditorScreen {
  constructor() {
    this.canvasBG = '#efefef';
    this.canvas = new fabric.Canvas('c', { backgroundColor: this.canvasBG });
    this.magnifier = new fabric.Canvas('magnifier', { backgroundColor: this.canvasBG });
    this.textMode = $('.nav-item[data-name="text"]');
    this.logoMode = $('.nav-item[data-name="logo"]');
    this.uploadsMode = $('.nav-item[data-name="uploads"]');
    this.backgroundMode = $('.nav-item[data-name="background"]');
    this.previewMode = $('.nav-item[data-name="preview"]');
    this.galleryMode = $('.nav-item[data-name="gallery"]');
    this.urlParams = new URLSearchParams(document.location.search);
    this.logoName = 'My Brand Name';
    this.sloganName = 'Slogan goes here';
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

    $('#back-main_3').addEventListener('click', () => {
      localStorage.setItem('mainEditorCounter', 1);
      location.reload();
    });

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

    // (function (fabric) {
    //   fabric.TextCurved = fabric.util.createClass(fabric.Object, {
    //     type: 'text-curved',
    //     diameter: 250,
    //     kerning: 0,
    //     text: '',
    //     flipped: false,
    //     fill: '#000',
    //     fontFamily: 'Times New Roman',
    //     fontSize: 24,
    //     fontWeight: 'normal',
    //     fontStyle: '',
    //     cacheProperties: fabric.Object.prototype.cacheProperties.concat(
    //       'diameter',
    //       'kerning',
    //       'flipped',
    //       'fill',
    //       'fontFamily',
    //       'fontSize',
    //       'fontWeight',
    //       'fontStyle',
    //       'strokeStyle',
    //       'strokeWidth'
    //     ),
    //     strokeStyle: null,
    //     strokeWidth: 0,

    //     initialize: function (text, options) {
    //       options || (options = {});
    //       this.text = text;
    //       this.callSuper('initialize', options);
    //       this.set('lockUniScaling', true);
    //       var canvas = this.getCircularText();
    //       this._trimCanvas(canvas);
    //       this.set('width', canvas.width);
    //       this.set('height', canvas.height);
    //     },

    //     _getFontDeclaration: function () {
    //       return [
    //         fabric.isLikelyNode ? this.fontWeight : this.fontStyle,
    //         fabric.isLikelyNode ? this.fontStyle : this.fontWeight,
    //         this.fontSize + 'px',
    //         fabric.isLikelyNode ? '"' + this.fontFamily + '"' : this.fontFamily,
    //       ].join(' ');
    //     },

    //     _trimCanvas: function (canvas) {
    //       var ctx = canvas.getContext('2d'),
    //         w = canvas.width,
    //         h = canvas.height,
    //         pix = { x: [], y: [] },
    //         n,
    //         imageData = ctx.getImageData(0, 0, w, h),
    //         fn = function (a, b) {
    //           return a - b;
    //         };

    //       for (var y = 0; y < h; y++) {
    //         for (var x = 0; x < w; x++) {
    //           if (imageData.data[(y * w + x) * 4 + 3] > 0) {
    //             pix.x.push(x);
    //             pix.y.push(y);
    //           }
    //         }
    //       }
    //       pix.x.sort(fn);
    //       pix.y.sort(fn);
    //       n = pix.x.length - 1;
    //       w = pix.x[n] - pix.x[0];
    //       h = pix.y[n] - pix.y[0];
    //       var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);
    //       canvas.width = w;
    //       canvas.height = h;
    //       ctx.putImageData(cut, 0, 0);
    //     },

    //     getCircularText: function () {
    //       var text = this.text,
    //         diameter = this.diameter,
    //         flipped = this.flipped,
    //         kerning = this.kerning,
    //         fill = this.fill,
    //         inwardFacing = true,
    //         startAngle = 0,
    //         canvas = fabric.util.createCanvasElement(),
    //         ctx = canvas.getContext('2d'),
    //         cw,
    //         x,
    //         clockwise = -1;
    //       if (flipped) {
    //         startAngle = 180;
    //         inwardFacing = false;
    //       }
    //       startAngle *= Math.PI / 180;
    //       var d = document.createElement('div');
    //       d.style.fontFamily = this.fontFamily;
    //       d.style.whiteSpace = 'nowrap';
    //       d.style.fontSize = this.fontSize + 'px';
    //       d.style.fontWeight = this.fontWeight;
    //       d.style.fontStyle = this.fontStyle;
    //       d.textContent = text;
    //       document.body.appendChild(d);
    //       var textHeight = d.offsetHeight;
    //       document.body.removeChild(d);
    //       canvas.width = canvas.height = diameter;
    //       ctx.font = this._getFontDeclaration();
    //       if (inwardFacing) {
    //         text = text.split('').reverse().join('');
    //       }
    //       ctx.translate(diameter / 2, diameter / 2);
    //       startAngle += Math.PI * !inwardFacing;
    //       ctx.textBaseline = 'middle';
    //       ctx.textAlign = 'center';
    //       for (x = 0; x < text.length; x++) {
    //         cw = ctx.measureText(text[x]).width;
    //         startAngle +=
    //           ((cw + (x == text.length - 1 ? 0 : kerning)) / (diameter / 2 - textHeight) / 2) * -clockwise;
    //       }
    //       ctx.rotate(startAngle);
    //       for (x = 0; x < text.length; x++) {
    //         cw = ctx.measureText(text[x]).width;
    //         ctx.rotate((cw / 2 / (diameter / 2 - textHeight)) * clockwise);
    //         if (this.strokeStyle && this.strokeWidth) {
    //           ctx.strokeStyle = this.strokeStyle;
    //           ctx.lineWidth = this.strokeWidth;
    //           ctx.miterLimit = 2;
    //           ctx.strokeText(text[x], 0, (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2));
    //         }
    //         ctx.fillStyle = fill;
    //         ctx.fillText(text[x], 0, (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2));
    //         ctx.rotate(((cw / 2 + kerning) / (diameter / 2 - textHeight)) * clockwise);
    //       }
    //       return canvas;
    //     },

    //     _set: function (key, value) {
    //       switch (key) {
    //         case 'scaleX':
    //           this.fontSize *= value;
    //           this.diameter *= value;
    //           this.width *= value;
    //           this.scaleX = 1;
    //           if (this.width < 1) {
    //             this.width = 1;
    //           }
    //           break;
    //         case 'scaleY':
    //           this.height *= value;
    //           this.scaleY = 1;
    //           if (this.height < 1) {
    //             this.height = 1;
    //           }
    //           break;
    //         default:
    //           this.callSuper('_set', key, value);
    //           break;
    //       }
    //     },

    //     _render: function (ctx) {
    //       var canvas = this.getCircularText();
    //       this._trimCanvas(canvas);
    //       this.set('width', canvas.width);
    //       this.set('height', canvas.height);
    //       ctx.drawImage(canvas, -this.width / 2, -this.height / 2, this.width, this.height);
    //       this.setCoords();
    //     },

    //     toObject: function (propertiesToInclude) {
    //       return this.callSuper(
    //         'toObject',
    //         [
    //           'text',
    //           'diameter',
    //           'kerning',
    //           'flipped',
    //           'fill',
    //           'fontFamily',
    //           'fontSize',
    //           'fontWeight',
    //           'fontStyle',
    //           'strokeStyle',
    //           'strokeWidth',
    //           'styles',
    //         ].concat(propertiesToInclude)
    //       );
    //     },
    //   });

    //   fabric.TextCurved.fromObject = function (object, callback) {
    //     return fabric.util.enlivenObjects([object], function (enlivenedObjects) {
    //       callback && callback(enlivenedObjects[0]);
    //     });
    //   };
    // })(typeof fabric !== 'undefined' ? fabric : require('fabric').fabric);
  }

  initialize() {
    const updatePreview = () => {
      const imageURL = this.canvas.toDataURL({
        format: 'png',
        multiplier: 0.5,
      });
      $('#magnifier_img').src = imageURL;
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

    this.updateActiveNavbar = (activeNav = 'logo') => {
      document.querySelectorAll('.nav-item').forEach((item) => {
        if (activeNav.includes(item.innerText.toLowerCase())) {
          item.style.backgroundColor = 'var(--gold-darker)';
        } else {
          item.style.backgroundColor = 'var(--gold)';
        }
      });
    };

    this.updateActiveNavbar();

    // this.settingsListTitle.addEventListener('click', () => {
    //   if (this.settingsList.classList.contains('show')) {
    //     this.settingsList.classList.remove('show');
    //   } else {
    //     this.settingsList.classList.add('show');
    //   }
    // });

    this.caseListTitle.addEventListener('click', (event) => {
      event.preventDefault();

      if (this.caseList.classList.contains('show')) {
        this.caseList.classList.remove('show');
      } else {
        this.caseList.classList.add('show');
      }
      [fontList, this.fontSizeList, fontStyleList].forEach((i) => i.classList.remove('show'));
    });

    // if (this.textSelectorValue === 'LogoName') {
    //   this.sloganNameInput.style.display = 'none';
    //   this.logoNameInput.style.display = 'block';
    // } else if (this.textSelectorValue === 'LogoName') {
    //   this.logoNameInput.style.display = 'none';
    //   this.sloganNameInput.style.display = 'block';
    // }

    // this.settingsList.addEventListener('click', (ev) => {
    //   const selectedTextElement = ev.target.innerText;
    //   if (selectedTextElement === 'Slogan Name') {
    //     this.textSelectorValue = 'SloganName';
    //     this.logoNameInput.style.display = 'none';
    //     this.sloganNameInput.style.display = 'block';
    //     this.canvas.setActiveObject(sloganNameElement);
    //     this.canvas.requestRenderAll();
    //   } else {
    //     this.textSelectorValue = 'LogoName';
    //     this.sloganNameInput.style.display = 'none';
    //     this.logoNameInput.style.display = 'block';
    //     this.canvas.setActiveObject(logoNameElement);
    //     this.canvas.requestRenderAll();
    //   }
    //   this.settingsListTitle.innerText = selectedTextElement;
    //   const icon = document.createElement('i');
    //   icon.className = 'fa-solid fa-angle-down';
    //   this.settingsListTitle.append(icon);
    //   this.settingsList.classList.remove('show');
    // });

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
      // console.log(selectedTextElement);

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

    // this.fontSizeList.addEventListener('click', (event) => {
    //   const text = event.target.innerText;
    //   const fontSize = text.split(' ')[0];

    //   const active = this.canvas.getActiveObject();
    //   active.fontSize = fontSize;

    //   this.fontSizeListTitle.innerText = fontSize + ' px';
    //   const icon = document.createElement('i');
    //   icon.className = 'fa-solid fa-angle-down';
    //   this.fontSizeListTitle.append(icon);
    //   this.fontSizeList.classList.remove('show');
    //   this.canvas.requestRenderAll();
    // });

    this.rotateRange.addEventListener('input', (e) => {
      this.isRotating = true;
      this.rotateValue = parseInt(e.target.value, 10);
      console.log(this.rotateValue);
      $('#rotate_info').innerText = ` :${this.rotateValue}deg`;
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
        multiplier: 10,
      });
      localStorage.setItem('saved_logo', savedLogo);
      localStorage.setItem('mainEditorCounter', 3);
      location.reload();
      setTimeout(() => {
        document.getElementById('drag_drop_view').style.display = 'none';
        document.getElementById('main_editor_view').style.display = 'none';
        document.getElementById('details_view').style.display = 'block';
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

    // this.scaleRangeUploads.addEventListener('input', (e) => {
    //   if (this.isScaling <= 10) this.isScaling = true;
    //   this.scaleElement.textContent = this.scaleValue;
    //   this.scaleValue = parseFloat(e.target.value, 10) / 10;
    //   this.scaleObject();
    // });

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

    function ColorChannelToHex(channel) {
      const hex = channel.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }

    function convertRGBtoHex(red, green, blue) {
      const redHex = ColorChannelToHex(red);
      const greenHex = ColorChannelToHex(green);
      const blueHex = ColorChannelToHex(blue);
      return `#${redHex}${greenHex}${blueHex}`;
    }

    function rgbToHex(rgbString) {
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
    }

    function hexToRgb(hexString) {
      hexString = hexString.replace(/^#/, '');

      let bigint = parseInt(hexString, 16);
      let r = (bigint >> 16) & 255;
      let g = (bigint >> 8) & 255;
      let b = bigint & 255;

      return `rgb(${r}, ${g}, ${b})`;
    }

    function hexToHsl(hexString) {
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
    }

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
        const layers = document.querySelectorAll('.layer-container');
        layers.forEach((layer, idx) => {
          const layerImg = layer.querySelector('.layer-img');
          const layerSpan = layer.querySelector('.layer-span');
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

    const textMain = ({ text, fontFamily = 'Poppins', fontSize = 32, fill = '#000000', id }) => {
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
        id,
      });
    };

    let logoNameElement = textMain({ text: this.logoName, id: 'logoNameElement' });
    let sloganNameElement = textMain({ text: this.sloganName, fontSize: 24, id: 'sloganNameElement' });

    if (this.logoFile) {
      fabric.loadSVGFromString(this.logoFile, (objects, options) => {
        const layerGroup = fabric.util.groupSVGElements(objects, options);

        objects.forEach((obj, idx) => {
          this.canvas.add(obj);
          const layerSection = new CreateLayerSection(this.layers);
          layerSection.create(obj, idx);

          obj.on('mousedown', (e) => {
            $('#logo-drop-shadow').checked = !!obj?.shadow?.blur;

            $('#rotate_info').innerText = ` :${obj.get('angle')}deg`;
            $('#rotate-bar').value = obj.get('angle');

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
            $('#HEX').value = fillColor;

            let rgbValue = hexToRgb(fillColor);
            let rgbValues = rgbValue.match(/\d+/g);

            if (rgbValues && rgbValues.length === 3) {
              $('#R').value = rgbValues[0];
              $('#G').value = rgbValues[1];
              $('#B').value = rgbValues[2];
            }

            let hslValue = hexToHsl(fillColor);
            let hslValues = hslValue.match(/\d+/g);

            if (hslValues && hslValues.length === 3) {
              $('#H').value = hslValues[0];
              $('#S').value = hslValues[1];
              $('#L').value = hslValues[2];
            }

            this.updateActiveNavbar('logo');
            this.logoSettingsContainer.style.display = 'grid';
            this.textSettingsContainer.style.display = 'none';
            this.backgroundSettingsContainer.style.display = 'none';
            this.canvas.requestRenderAll();
          });
        });

        const originalWidth = layerGroup.width;
        const originalHeight = layerGroup.height;

        const fixedWidth = 200;
        const fixedHeight = 200;

        const widthScaleFactor = fixedWidth / originalWidth;
        const heightScaleFactor = fixedHeight / originalHeight;

        const scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);
        layerGroup.scale(scaleFactor);

        this.canvas.centerObject(layerGroup);
        this.canvas.viewportCenterObject(layerGroup);
        layerGroup.ungroupOnCanvas();
        this.canvas.requestRenderAll();
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
      $(className)?.append(icon);
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

    // this.logoNameInput.addEventListener('input', (e) => {
    //   logoNameElement.set('text', e.target.value);
    //   const queryParams = new URLSearchParams(window.location.search);
    //   queryParams.set('logo_name', e.target.value);
    //   localStorage.setItem('logo_name', e.target.value);
    //   logoNameElement.centerH();
    //   updatePreview();
    //   this.canvas.requestRenderAll();
    // });

    // this.sloganNameInput.addEventListener('input', (e) => {
    //   sloganNameElement.set('text', e.target.value);
    //   const queryParams = new URLSearchParams(window.location.search);
    //   queryParams.set('slogan_name', e.target.value);
    //   localStorage.setItem('slogan_name', e.target.value);
    //   sloganNameElement.centerH();
    //   updatePreview();
    //   this.canvas.renderAll();
    // });

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
      this.updateActiveNavbar('text');
      this.logoSettingsContainer.style.display = 'none';
      this.textSettingsContainer.style.display = 'grid';
      this.backgroundSettingsContainer.style.display = 'none';
      this.uploadSettingsContainer.style.display = 'none';
      this.canvas.renderAll();
    });

    this.logoMode.addEventListener('click', () => {
      this.updateActiveNavbar('logo');
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
      this.updateActiveNavbar('background');
    });

    this.previewMode.addEventListener('click', () => {
      const bgColor = this.canvas.get('backgroundColor');
      if (bgColor === '#efefef') {
        this.canvas.setBackgroundColor(null, this.canvas.renderAll.bind(this.canvas));
      }
      this.canvas.setBackgroundImage(null, this.canvas.renderAll.bind(this.canvas));
      this.canvas.requestRenderAll();

      $('.preview-modal-bg').style.display = 'block';

      const logo = this.canvas.toDataURL({
        format: 'png',
        multiplier: 3,
      });

      $('#fixed_preview').src = logo;
      // document.querySelector('#right-arrow').click();
    });

    this.letterSpacingSlider.addEventListener('input', (e) => {
      this.letterSpacing = e.target.value;
      console.log(e.target.value);
      const active = this.canvas.getActiveObject();
      active.set('charSpacing', this.letterSpacing);
      $('#l_spacing_value').innerText = ': ' + e.target.value / 10;
      this.canvas.requestRenderAll();
    });

    this.shadowBlurSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      this.shadowBlur = value;
      $('#shadow_blur_title').innerText = ` :${value}px`;
      this.shadowChanger(sloganNameElement, logoNameElement);
      this.canvas.requestRenderAll();
    });

    // $('#align-btn').addEventListener('click', () => {
    //   const active = this.canvas.getActiveObject();
    //   if (typeof active?.text === 'string') {
    //     active.centerH();
    //   }
    // });

    $('#logo-shadow-blur-slider').addEventListener('input', (e) => {
      this.logoShadowBlur = e.target.value;
      const active = this.canvas.getActiveObjects();
      $('#logo-shadow_blur_title').innerText = ` :${e.target.value}px`;
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
      $('#offset_x_title').innerText = ` :${val}px`;
      this.shadowChanger(sloganNameElement, logoNameElement);
      this.canvas.requestRenderAll();
    });

    this.logoShadowOffsetXSlider.addEventListener('input', (e) => {
      this.logoShadowOffsetX = e.target.value;

      $('#logo-shadow_offsetX').innerText = ` :${e.target.value}px`;
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
      $('#offset_y_title').innerText = ` :${val}px`;
      this.shadowChanger(sloganNameElement, logoNameElement);
      this.canvas.requestRenderAll();
    });

    this.logoShadowOffsetYSlider.addEventListener('input', (e) => {
      this.logoShadowOffsetY = e.target.value;
      $('#logo-shadow_offsetY').innerText = ` :${e.target.value}px`;
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
    const fontStyleListTitle = document.querySelector('.font_style-list-item__title');
    const fontStyleList = document.querySelector('.font_style-list-items-li');

    fontSelectorTitle.addEventListener('click', (event) => {
      event.stopPropagation();

      if (fontList.classList.contains('show')) {
        fontList.classList.remove('show');
      } else {
        fontList.classList.add('show');
      }

      [fontStyleList, this.caseList].forEach((i) => i.classList.remove('show'));
    });

    this.fontStyleListTitle.addEventListener('click', (event) => {
      event.stopPropagation();

      if (this.fontStyleList.classList.contains('show')) {
        this.fontStyleList.classList.remove('show');
      } else {
        this.fontStyleList.classList.add('show');
      }
      [fontList, this.caseList].forEach((i) => i.classList.remove('show'));
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

    // for (let i = 8; i <= 80; i++) {
    //   document.querySelector('.font_size-list-items-li');
    //   const li = document.createElement('li');
    //   li.append(i + ' px');
    //   this.fontSizeList.append(li);
    // }

    // this.fontSizeListTitle.addEventListener('click', () => {
    //   if (this.fontSizeList.classList.contains('show')) {
    //     this.fontSizeList.classList.remove('show');
    //   } else {
    //     this.fontSizeList.classList.add('show');
    //   }
    // });

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
      let active = this.canvas.getActiveObject();
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
      this.canvas.renderAll();
      const title = this.fontSelector.querySelector('.font-selector-title');
      title.textContent = fontValue;
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-angle-down';
      title.append(icon);
      fontList.classList.remove('show');
    });

    this.canvas.on('object:added', () => {
      captureCanvasState();
      updatePreview();
    });
    this.canvas.on('object:removed', () => {
      captureCanvasState();
      updatePreview();
    });
    this.canvas.on('object:modified', () => {
      captureCanvasState();
      updatePreview();
    });
    this.canvas.on('object:moving', () => {
      captureCanvasState();
      updatePreview();
    });

    let localDirFile = null;
    let localDirFiles = null;
    document.onkeydown = (event) => {
      if (event.key === 'Delete') {
        const deleteLayer = new DeleteLayer(event, this.canvas, this.layers, this.activeLayerIndex);
        deleteLayer.deleteLayer();
        localDirFile = null;
      }
    };

    let verticalLine, horizontalLine;

    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    const gridSize = 12.255;
    const snappingThreshold = gridSize / 2;

    // for (var i = 0; i < this.canvas.width / gridSize; i++) {
    //   this.canvas.add(
    //     new fabric.Line([i * gridSize, 0, i * gridSize, this.canvas.width], {
    //       stroke: '#ccc',
    //       selectable: false,
    //     })
    //   );
    //   this.canvas.add(
    //     new fabric.Line([0, i * gridSize, this.canvas.width, i * gridSize], {
    //       stroke: '#ccc',
    //       selectable: false,
    //     })
    //   );
    // }

    let canvasCenter = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
    };

    const line1 = new fabric.Line([0, canvasCenter.y, this.canvas.getWidth(), canvasCenter.y], {
      stroke: 'blue',
      selectable: false,
      visible: false,
      lockMovementX: true,
      lockMovementY: true,
      hasControls: false,
      hasRotatingPoint: false,
    });

    const line2 = new fabric.Line([canvasCenter.x, 0, canvasCenter.x, this.canvas.getHeight()], {
      stroke: 'blue',
      selectable: false,
      visible: false,
      lockMovementX: true,
      lockMovementY: true,
      hasControls: false,
      hasRotatingPoint: false,
    });

    // this.canvas.add(line1, line2);

    this.canvas.on('object:moving', (e) => {
      const obj = e.target;

      const snappedLeft = Math.round(obj.left / gridSize) * gridSize;
      const snappedTop = Math.round(obj.top / gridSize) * gridSize;

      const objectCenter = {
        x: snappedLeft + (obj.width * obj.scaleX) / 2,
        y: snappedTop + (obj.height * obj.scaleY) / 2,
      };

      if (
        Math.abs(canvasCenter.x - objectCenter.x) <= snappingThreshold ||
        Math.abs(canvasCenter.y - objectCenter.y) <= snappingThreshold
      ) {
        obj.set({ left: snappedLeft, top: snappedTop });

        line1.set('visible', true);
        line2.set('visible', true);
      } else {
        obj.setCoords();
        line1.set('visible', false);
        line2.set('visible', false);
      }

      this.canvas.requestRenderAll();
    });

    this.canvas.on('object:modified', () => {
      captureCanvasState();
      updatePreview();
      line1.set('visible', false);
      line2.set('visible', false);
    });

    // this.canvas.on('mouse:over', (e) => {
    //   if (e.target) {
    //     const activeObject = e.target;

    //     activeObject.set({
    //       borderColor: 'blue',
    //       cornerColor: 'blue',
    //     });

    //     this.canvas.setActiveObject(activeObject);
    //     this.canvas.requestRenderAll();
    //   }
    // });

    // this.canvas.on('mouse:down', (e) => {
    //   if (e.target) {
    //     const activeObject = e.target;

    //     activeObject.set({
    //       borderColor: 'blue',
    //       cornerColor: 'blue',
    //     });

    //     this.canvas.setActiveObject(activeObject);
    //     this.canvas.requestRenderAll();
    //   }
    // });

    // this.canvas.on('selection:created', () => {
    //   let activeObject = this.canvas.getActiveObject();
    //   if (!activeObject) return;

    //   const movementIncrement = 5;

    //   const handler = (e) => {
    //     const getPosition = (position) => activeObject.get(position);

    //     switch (e.key) {
    //       case 'ArrowLeft':
    //         activeObject.set('left', getPosition('left') - movementIncrement);
    //         break;
    //       case 'ArrowUp':
    //         activeObject.set('top', getPosition('top') - movementIncrement);
    //         break;
    //       case 'ArrowRight':
    //         activeObject.set('left', getPosition('left') + movementIncrement);
    //         break;
    //       case 'ArrowDown':
    //         activeObject.set('top', getPosition('top') + movementIncrement);
    //         break;
    //       default:
    //         return;
    //     }

    //     e.preventDefault();
    //     this.canvas.renderAll();
    //   };

    //   document.addEventListener('keydown', handler);

    //   this.canvas.on('selection:cleared', () => {
    //     document.removeEventListener('keydown', handler);
    //     activeObject = null;
    //   });
    // });

    // this.canvas.on('selection:updated', () => {
    //   const activeObject = this.canvas.getActiveObject();
    //   document.onkeydown = (e) => {
    //     if (activeObject === undefined || activeObject === null) return;

    //     const movementIncrement = 5;

    //     switch (e.key) {
    //       case 'ArrowLeft':
    //         activeObject.set('left', activeObject.get('left') - movementIncrement);
    //         break;
    //       case 'ArrowUp':
    //         activeObject.set('top', activeObject.get('top') - movementIncrement);
    //         break;
    //       case 'ArrowRight':
    //         activeObject.set('left', activeObject.get('left') + movementIncrement);
    //         break;
    //       case 'ArrowDown':
    //         activeObject.set('top', activeObject.get('top') + movementIncrement);
    //         break;
    //     }
    //     this.canvas.renderAll();
    //   };
    // });

    function rgbaToHex(rgbaString) {
      var match = rgbaString.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);

      if (!match) {
        return 'Invalid RGBA string';
      }

      var r = parseInt(match[1]);
      var g = parseInt(match[2]);
      var b = parseInt(match[3]);

      function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? '0' + hex : hex;
      }

      var hex = '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);

      return hex;
    }

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

      $('#drop-shadow').checked = !!logoNameElement?.shadow?.blur;

      if (!!logoNameElement?.shadow?.blur) {
        $('#logo-shadow-adjust').style.display = 'block';
        $('#logo-shadow-blur').style.display = 'block';
        $('#logo-shadow-offsetX').style.display = 'block';
        $('#logo-shadow-offsetY').style.display = 'block';
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

      $('.font_style-list-item__title').innerText = logoNameElement.fontStyle;
      putAngleDownIcon('.font_style-list-item__title');

      const letterSpacing = logoNameElement.get('charSpacing');
      $('#letter-spacing-slider').value = letterSpacing;

      const fontFamily = logoNameElement.fontFamily;
      $('#font-selector-title').innerText = fontFamily;
      putAngleDownIcon('#font-selector-title');

      const fontSize = logoNameElement.fontSize;
      $('#font_size_title').value = `${fontSize}px`;
      $('#font_size_range').value = fontSize;

      const logoText = logoNameElement.text;
      $('.case-list-item__title').innerText = getTextCase(logoText);
      putAngleDownIcon('.case-list-item__title');

      if (logoNameElement.shadow) {
        const { blur, offsetX, offsetY } = logoNameElement.shadow;

        if (blur && offsetX && offsetY) {
          $('#shadow_blur_title').innerText = ` :${blur}px`;
          $('#shadow-blur-slider').value = blur;
          $('#offset_x_title').innerText = ` :${offsetX}px`;
          $('#shadow-offsetX-slider').value = offsetX;
          $('#offset_y_title').innerText = ` :${offsetY}px`;
          $('#shadow-offsetY-slider').value = offsetY;
        }
      }
      captureCanvasState();
      this.canvas.requestRenderAll();
    });

    sloganNameElement.on('mousedown', (event) => {
      event.e.preventDefault();
      this.textSelectorValue = 'SloganName';

      $('#drop-shadow').checked = !!sloganNameElement?.shadow?.blur;

      if (!!sloganNameElement?.shadow?.blur) {
        $('#logo-shadow-adjust').style.display = 'block';
        $('#logo-shadow-blur').style.display = 'block';
        $('#logo-shadow-offsetX').style.display = 'block';
        $('#logo-shadow-offsetY').style.display = 'block';
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

      $('.font_style-list-item__title').innerText = sloganNameElement.fontStyle;
      putAngleDownIcon('.font_style-list-item__title');

      const letterSpacing = +sloganNameElement.charSpacing;
      $('#letter-spacing-slider').value = letterSpacing;

      const fontSize = sloganNameElement.fontSize;
      $('#font_size_title').value = `${fontSize}px`;
      $('#font_size_range').value = fontSize;

      const logoText = sloganNameElement.text;
      $('.case-list-item__title').innerText = getTextCase(logoText);
      putAngleDownIcon('.case-list-item__title');

      if (sloganNameElement.shadow) {
        const { blur, offsetX, offsetY } = sloganNameElement.shadow;

        if (blur && offsetX && offsetY) {
          $('#shadow_blur_title').innerText = ` :${blur}px`;
          $('#shadow-blur-slider').value = blur;
          $('#offset_x_title').innerText = ` :${offsetX}px`;
          $('#shadow-offsetX-slider').value = offsetX;
          $('#offset_y_title').innerText = ` :${offsetY}px`;
          $('#shadow-offsetY-slider').value = offsetY;
        }
      }

      captureCanvasState();
      this.canvas.requestRenderAll();
    });

    const undoHistory = [];
    let currIndex = -1;
    let captureTimeout = null;

    const captureCanvasState = () => {
      clearTimeout(captureTimeout);

      if (undoHistory.length < 10) {
        captureTimeout = setTimeout(() => {
          undoHistory.push(JSON.stringify(this.canvas.toDatalessJSON()));
          currIndex = undoHistory.length - 1;
        }, 500);
      } else if (undoHistory.length > 10) {
        currIndex = -1;
        undoHistory.splice(0, undoHistory.length);
      }
    };

    const undo = () => {
      if (currIndex > 0) {
        setCanvasBackground();
        currIndex -= 1;
        const stateToRestore = JSON.parse(undoHistory[currIndex]);
        this.canvas.clear();

        this.canvas.loadFromJSON(stateToRestore, () => {
          const logoNameElement = this.canvas.getObjects().find((i) => i.text === 'My Brand Name');
          const sloganNameElement = this.canvas.getObjects().find((i) => i.text === 'Slogan goes here');

          this.canvas.getObjects().forEach((item) => {
            if (!item.text) {
              item.on('mousedown', () => {
                const updateActiveNavbar = (activeNav = 'logo') => {
                  document.querySelectorAll('.nav-item').forEach((item) => {
                    if (activeNav.includes(item.innerText.toLowerCase())) {
                      item.style.backgroundColor = 'var(--gold-darker)';
                    } else {
                      item.style.backgroundColor = 'var(--gold)';
                    }
                  });
                };
                updateActiveNavbar();
              });
            }
          });

          logoNameElement.on('mousedown', (e) => {
            e.e.preventDefault();
            this.textSelectorValue = 'LogoName';

            $('#drop-shadow').checked = !!logoNameElement?.shadow?.blur;

            if (!!logoNameElement?.shadow?.blur) {
              $('#logo-shadow-adjust').style.display = 'block';
              $('#logo-shadow-blur').style.display = 'block';
              $('#logo-shadow-offsetX').style.display = 'block';
              $('#logo-shadow-offsetY').style.display = 'block';
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

            $('.font_style-list-item__title').innerText = logoNameElement.fontStyle;
            putAngleDownIcon('.font_style-list-item__title');

            const letterSpacing = logoNameElement.get('charSpacing');
            $('#letter-spacing-slider').value = letterSpacing;

            const fontFamily = logoNameElement.fontFamily;
            $('#font-selector-title').innerText = fontFamily;
            putAngleDownIcon('#font-selector-title');

            const fontSize = logoNameElement.fontSize;
            $('#font_size_title').value = `${fontSize}px`;
            $('#font_size_range').value = fontSize;

            const logoText = logoNameElement.text;
            $('.case-list-item__title').innerText = getTextCase(logoText);
            putAngleDownIcon('.case-list-item__title');

            if (logoNameElement.shadow) {
              const { blur, offsetX, offsetY } = logoNameElement.shadow;

              if (blur && offsetX && offsetY) {
                $('#shadow_blur_title').innerText = ` :${blur}px`;
                $('#shadow-blur-slider').value = blur;
                $('#offset_x_title').innerText = ` :${offsetX}px`;
                $('#shadow-offsetX-slider').value = offsetX;
                $('#offset_y_title').innerText = ` :${offsetY}px`;
                $('#shadow-offsetY-slider').value = offsetY;
              }
            }
            captureCanvasState();
            this.canvas.requestRenderAll();

            const updateActiveNavbar = (activeNav = 'logo') => {
              document.querySelectorAll('.nav-item').forEach((item) => {
                if (activeNav.includes(item.innerText.toLowerCase())) {
                  item.style.backgroundColor = 'var(--gold-darker)';
                } else {
                  item.style.backgroundColor = 'var(--gold)';
                }
              });
            };
            updateActiveNavbar('text');

            this.logoSettingsContainer.style.display = 'none';
            this.textSettingsContainer.style.display = 'grid';
            this.backgroundSettingsContainer.style.display = 'none';
          });

          sloganNameElement.on('mousedown', (event) => {
            event.e.preventDefault();
            this.textSelectorValue = 'SloganName';
            
            $('#drop-shadow').checked = !!sloganNameElement?.shadow?.blur;

            if (!!sloganNameElement?.shadow?.blur) {
              $('#logo-shadow-adjust').style.display = 'block';
              $('#logo-shadow-blur').style.display = 'block';
              $('#logo-shadow-offsetX').style.display = 'block';
              $('#logo-shadow-offsetY').style.display = 'block';
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

            $('.font_style-list-item__title').innerText = sloganNameElement.fontStyle;
            putAngleDownIcon('.font_style-list-item__title');
            const fontSize = sloganNameElement.fontSize;
            $('#font_size_range').value = fontSize;

            const letterSpacing = +sloganNameElement.charSpacing;
            $('#letter-spacing-slider').value = letterSpacing;

            $('#font_size_title').value = `${fontSize}px`;

            const logoText = sloganNameElement.text;
            $('.case-list-item__title').innerText = getTextCase(logoText);
            putAngleDownIcon('.case-list-item__title');

            if (sloganNameElement.shadow) {
              const { blur, offsetX, offsetY } = sloganNameElement.shadow;

              if (blur && offsetX && offsetY) {
                $('#shadow_blur_title').innerText = ` :${blur}px`;
                $('#shadow-blur-slider').value = blur;
                $('#offset_x_title').innerText = ` :${offsetX}px`;
                $('#shadow-offsetX-slider').value = offsetX;
                $('#offset_y_title').innerText = ` :${offsetY}px`;
                $('#shadow-offsetY-slider').value = offsetY;
              }
            }

            captureCanvasState();
            this.canvas.requestRenderAll();
            
            const updateActiveNavbar = (activeNav = 'logo') => {
              document.querySelectorAll('.nav-item').forEach((item) => {
                if (activeNav.includes(item.innerText.toLowerCase())) {
                  item.style.backgroundColor = 'var(--gold-darker)';
                } else {
                  item.style.backgroundColor = 'var(--gold)';
                }
              });
            };
            updateActiveNavbar('text');

            this.logoSettingsContainer.style.display = 'none';
            this.textSettingsContainer.style.display = 'grid';
            this.backgroundSettingsContainer.style.display = 'none';
          });

          document.querySelectorAll('#solid_color').forEach((item) => {
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
                    console.log({ hexColor });
                    captureCanvasState();

                    const logoColorPickers = document.querySelectorAll('#color-layers-pickers');
                    logoColorPickers.forEach((i) => i.remove());

                    let colorSet = new Set();

                    this.canvas.getObjects().forEach((item, idx) => {
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
                          const activeElem = this.canvas.getActiveObject();
                          activeElem.set('fill', color);
                          this.canvas.requestRenderAll();
                        });
                      }
                    });

                    updatePreview();
                    captureCanvasState();

                    this.canvas.requestRenderAll();
                  }
                }
              }
            });
          });

          document.querySelectorAll('#solid_color2').forEach((item) => {
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

                    updatePreview();
                    captureCanvasState();
                    this.canvas.requestRenderAll();
                  }
                }
              }
            });
          });
        });
      }
    };

    $('#font_size_range').addEventListener('input', (event) => {
      const textSize = event.target.value;
      $('#font_size_title').value = `${textSize}px`;

      const fontSize = textSize;

      const active = this.canvas.getActiveObject();
      active.fontSize = fontSize;

      this.canvas.requestRenderAll();
    });

    $('#font_size_title').addEventListener('input', (event) => {
      const text = event.target.value;
      const fontSize = Number(text.split('px')[0]);
      const active = this.canvas.getActiveObject();
      active.fontSize = fontSize;
      $('#font_size_range').value = fontSize;

      this.canvas.requestRenderAll();
    });

    const arrowFontResizer = (type = 'increment') => {
      const active = this.canvas.getActiveObject();
      const increment = active.fontSize + 1;
      const decrement = active.fontSize - 1;

      const fontResizer =
        type === 'increment' ? (active.fontSize = increment) : (active.fontSize = decrement);
      $('#font_size_range').value = fontResizer;
      $('#font_size_title').value = fontResizer + 'px';
      this.canvas.requestRenderAll();
    };

    $('#font_size_up').addEventListener('click', () => void arrowFontResizer('increment'));
    $('#font_size_down').addEventListener('click', () => void arrowFontResizer('decrement'));

    $('#font_size_title').addEventListener('keydown', (event) => {
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

    const redo = () => {
      if (undoHistory.length > 0) {
        setCanvasBackground();
        currIndex += 1;
        const stateToRestore = JSON.parse(undoHistory[currIndex]);
        this.canvas.clear();

        this.canvas.loadFromJSON(stateToRestore, () => {
          this.canvas.requestRenderAll();
        });
      }
    };

    document.getElementById('undo-btn').addEventListener('click', undo);
    document.getElementById('redo-btn').addEventListener('click', redo);

    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.key === 'z') {
        undo();
      }

      if (e.ctrlKey && e.key === 'y') {
        redo();
        this.canvas.requestRenderAll();
      }
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

    // this.canvas.on('mousedown', (e) => {
    //   if (e.target) {
    //     const currentObjColor = e.target.get('fill');
    //     const colorPalette = $('#color-palette-gradient');

    //     if (typeof currentObjColor === 'string') {
    //       colorPalette.style.background = currentObjColor;
    //       document.querySelector('#grad-solid').value = currentObjColor;
    //     } else if (currentObjColor && currentObjColor.type === 'radial') {
    //       const gradientColors = convertFabricColorsToRGB(currentObjColor);
    //       const gradientStyle = `linear-gradient(0, ${gradientColors.join(', ')})`;
    //       colorPalette.style.background = gradientStyle;
    //       document.querySelector('#grad-1').value = gradientStyle;
    //       document.querySelector('#grad-2').value = gradientStyle;
    //       document.querySelector('#grad-solid').value = gradientStyle;
    //     }
    //     this.canvas.requestRenderAll();
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

    $('#copyElement').addEventListener('click', () => {
      const activeObject = this.canvas.getActiveObject();
      activeObject.clone((cloned) => {
        this.canvas.add(cloned);
        cloned.top += 10;
        cloned.left += 10;
      });
      this.canvas.requestRenderAll();
    });

    $('#eyeElement').addEventListener('click', () => {
      const activeObj = this.canvas.getActiveObject();
      let visibilty = Boolean(activeObj.get('opacity'));
      visibilty = !visibilty;
      activeObj.set('opacity', visibilty ? 1 : 0);
      this.canvas.requestRenderAll();
    });

    $('#removeElement').addEventListener('click', () => {
      const activeObj = this.canvas.getActiveObject();
      if (activeObj) {
        this.canvas.remove(activeObj);
        this.canvas.renderAll();
      }
    });

    $('#bringDownElement').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.sendBackwards(selectedObject);
      this.canvas.requestRenderAll();
    });

    $('#bringUpElement').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.bringForward(selectedObject);
      this.canvas.requestRenderAll();
    });

    $('#copyElement2').addEventListener('click', () => {
      const activeObject = this.canvas.getActiveObject();
      activeObject.clone((cloned) => {
        this.canvas.add(cloned);
        cloned.top += 10;
        cloned.left += 10;
      });
      this.canvas.requestRenderAll();
    });

    $('#eyeElement2').addEventListener('click', () => {
      const activeObj = this.canvas.getActiveObject();
      let visibilty = Boolean(activeObj.get('opacity'));
      visibilty = !visibilty;
      activeObj.set('opacity', visibilty ? 1 : 0);
      this.canvas.requestRenderAll();
    });

    $('#removeElement2').addEventListener('click', () => {
      const activeObj = this.canvas.getActiveObject();
      this.canvas.remove(activeObj);
      this.canvas.requestRenderAll();
    });

    $('#bringDownElement2').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.sendBackwards(selectedObject);
      this.canvas.requestRenderAll();
    });

    $('#bringUpElement2').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.bringForward(selectedObject);
      this.canvas.requestRenderAll();
    });

    $('#eyeElement-uploads').addEventListener('click', () => {
      const activeObj = this.canvas.getActiveObject();
      let visibilty = activeObj.visible;
      visibilty = !visibilty;
      activeObj.set('visible', visibilty);
      this.canvas.requestRenderAll();
    });

    $('#copyElement-uploads').addEventListener('click', (event) => {
      this.canvas.getActiveObject().clone((cloned) => {
        this.canvas.add(cloned);
        this.canvas.centerObject(cloned);
        this.canvas.requestRenderAll();
      });
    });

    $('#bringUpElement-uploads').addEventListener('click', () => {
      const selectedObject = this.canvas.getActiveObject();
      this.canvas.bringForward(selectedObject);
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

      console.log(colorAngle);

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
      $(
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
    });

    const logoPalleteComponent = $('#logo-pallete');
    logoPalleteComponent.addEventListener('colorChange', (e) => {
      const selectedObject = this.canvas.getActiveObject();
      const { colorMode, grad1Value, grad2Value, solidValue, colorAngle } = e.detail;
      console.log(colorAngle);

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
    });

    // const textPalleteComponent = $('#text-pallete');
    // textPalleteComponent.addEventListener('colorChange', (e) => {
    //   const selectedObject = this.canvas.getActiveObject();
    //   const { colorMode, grad1Value, grad2Value, solidValue } = e.detail;

    //   let color = null;
    //   if (colorMode !== 'Solid') {
    //     color = new fabric.Gradient({
    //       type: 'linear',
    //       coords: {
    //         x1: 0,
    //         y1: 0,
    //         x2: selectedObject.width,
    //         y2: selectedObject.height,
    //       },
    //       colorStops: [
    //         { offset: 0, color: grad1Value },
    //         { offset: 1, color: grad2Value },
    //       ],
    //     });
    //   } else {
    //     color = solidValue;
    //   }

    //   selectedObject.set('fill', color);
    //   this.canvas.requestRenderAll();
    // });

    updatePreview();

    let previewImages = ['/static/mug.png', '/static/wall.png'];
    let counter = previewImages.length - 1;

    $('#right-arrow').addEventListener('click', () => {
      counter++;
      if (counter >= previewImages.length) {
        counter = 0;
      }

      const img = previewImages[counter];

      $('.preview_image_wrapper').style.backgroundImage = 'url(' + img.toString() + ')';
      $('.preview_image').style.marginTop = counter === 0 ? '100px' : '-100px';
    });

    $('#left-arrow').addEventListener('click', () => {
      if (counter === 0) {
        counter = previewImages.length - 1;
      } else {
        counter--;
      }

      const img = previewImages[counter];

      $('.preview_image_wrapper').style.backgroundImage = 'url(' + img.toString() + ')';
      $('.preview_image').style.marginTop = counter === 0 ? '100px' : '-100px';
    });

    $('#close_modal').addEventListener('click', () => {
      setCanvasBackground();
      // this.canvas.setBackgroundColor('#eee', this.canvas.renderAll.bind(this.canvas));
      document.querySelector('.preview-modal-bg').style.display = 'none';
    });

    $('#overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('overlay')) {
        setCanvasBackground();
        this.canvas.setBackgroundColor('#eee', this.canvas.renderAll.bind(this.canvas));
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

        const active = this.canvas.getActiveObject();
        active.set('shadow', {
          offsetX: 2,
          offsetY: 2,
          blur: 5,
        });
        this.canvas.requestRenderAll();
      } else {
        $('#logo-shadow-adjust').style.display = 'none';
        $('#logo-shadow-blur').style.display = 'none';
        $('#logo-shadow-offsetX').style.display = 'none';
        $('#logo-shadow-offsetY').style.display = 'none';

        const active = this.canvas.getActiveObject();
        active.set('shadow', {
          offsetX: 0,
          offsetY: 0,
          blur: 0,
        });
        this.canvas.requestRenderAll();
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

    let isShadowAdjust = !!this.canvas.getActiveObject()?.shadow?.blur;
    document.getElementById('drop-shadow').addEventListener('change', () => {
      isShadowAdjust = !isShadowAdjust;

      if (isShadowAdjust) {
        $('#shadow-adjust').style.display = 'block';
        const settingsView = $('.settings-view');
        settingsView.scrollTop = settingsView.scrollHeight;

        const active = this.canvas.getActiveObject();
        active.set('shadow', {
          offsetX: 2,
          offsetY: 2,
          blur: 5,
        });
        this.canvas.requestRenderAll();
      } else {
        $('#shadow-adjust').style.display = 'none';
        $('#shadow-blur').style.display = 'none';
        $('#shadow-offsetX').style.display = 'none';
        $('#shadow-offsetY').style.display = 'none';

        const active = this.canvas.getActiveObject();
        active.set('shadow', {
          offsetX: 0,
          offsetY: 0,
          blur: 0,
        });
        this.canvas.requestRenderAll();
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

    const canvasObjects = this.canvas.getObjects();
    const colorPalette = $('#logo_colors_pallete');
    const textPalette = $('#logo_text_colors_pallete');

    const solidColorMode = $('#solid_color_mode');
    const pickerColorMode = $('#picker_color_mode');

    const solidColorTextMode = $('#solid_color_text_mode');
    const pickerColorTextMode = $('#picker_color_text_mode');

    let itemFill, colPicker;

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
          }
          colPicker.addEventListener('click', (event) => {
            const color = rgbToHex(event.target.style.backgroundColor);
            const activeElem = this.canvas.getActiveObject();
            activeElem.set('fill', color);
            this.canvas.requestRenderAll();
          });
        }
      });

      updatePreview();
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

        $('#H').value = hsl.h;
        $('#S').value = hsl.s;
        $('#L').value = hsl.l;
        $('#R').value = rgb.r;
        $('#G').value = rgb.g;
        $('#B').value = rgb.b;

        $('#HEX').value = color.hexString;
      }

      const active = this.canvas.getActiveObject();
      active.set('fill', color.rgbaString);

      const logoColorPickers = document.querySelectorAll('#color-layers-pickers');
      logoColorPickers.forEach((i) => i.remove());
      updateColorPickers();
      this.canvas.requestRenderAll();

      colorChanging = false;
    });

    this.canvas.on('object:moving', function (e) {
      if (colorChanging) {
        e.preventDefault();
      }
    });

    [('#R', '#G', '#B')].forEach((id) => {
      $(id).addEventListener('input', () => {
        let r = $('#R').value;
        let g = $('#G').value;
        let b = $('#B').value;
        colorPicker.color.rgb = { r, g, b };
        const a = this.canvas.getActiveObject();
        a.set('fill', colorPicker.color.hexString);
        this.canvas.requestRenderAll();
      });
    });

    ['#H', '#S', '#L'].forEach((id) => {
      $(id).addEventListener('input', () => {
        let h = $('#H').value;
        let s = $('#S').value;
        let l = $('#L').value;
        colorPicker.color.hsl = { h, s, l };
        const a = this.canvas.getActiveObject();
        a.set('fill', colorPicker.color.hexString);
        this.canvas.requestRenderAll();
      });
    });

    [('#R2', '#G2', '#B2')].forEach((id) => {
      $(id).addEventListener('input', () => {
        let r = $('#R2').value;
        let g = $('#G2').value;
        let b = $('#B2').value;
        colorPicker.color.rgb = { r, g, b };
        const a = this.canvas.getActiveObject();
        a.set('fill', colorPicker.color.hexString);
        this.canvas.requestRenderAll();
      });
    });

    ['#H2', '#S2', '#L2'].forEach((id) => {
      $(id).addEventListener('input', () => {
        let h = $('#H2').value;
        let s = $('#S2').value;
        let l = $('#L2').value;
        colorPicker.color.hsl = { h, s, l };
        const a = this.canvas.getActiveObject();
        a.set('fill', colorPicker.color.hexString);
        this.canvas.requestRenderAll();
      });
    });

    let inputCountBG = 0;
    let inputCount2 = 0;

    $('#HEX').addEventListener('input', (e) => {
      let hex = e.target.value;

      if (hex.length > 0 && hex[0] !== '#') {
        if (inputCountBG >= 3) {
          hex = '#' + hex;
          $('#HEX').value = hex;
          inputCountBG = 0;
        } else {
          inputCountBG++;
        }
      }

      colorPicker.color.set(hex);
      const a = this.canvas.getActiveObject();
      a.set('fill', hex);

      let r = $('#R').value;
      let g = $('#G').value;
      let b = $('#B').value;
      colorPicker.color.rgb = { r, g, b };
      let h = $('#H').value;
      let s = $('#S').value;
      let l = $('#L').value;
      colorPicker.color.hsl = { h, s, l };

      this.canvas.requestRenderAll();
    });

    $('#HEX2').addEventListener('input', (e) => {
      let hex = e.target.value;

      if (hex.length > 0 && hex[0] !== '#') {
        if (inputCount2 >= 3) {
          hex = '#' + hex;
          $('#HEX2').value = hex;
          inputCount2 = 0;
        } else {
          inputCount2++;
        }
      }

      colorPicker.color.set(hex);
      const a = this.canvas.getActiveObject();
      a.set('fill', hex);

      let r = $('#R2').value;
      let g = $('#G2').value;
      let b = $('#B2').value;
      colorPicker.color.rgb = { r, g, b };
      let h = $('#H2').value;
      let s = $('#S2').value;
      let l = $('#L2').value;
      colorPicker.color.hsl = { h, s, l };

      this.canvas.requestRenderAll();
    });

    const solidColorEvent = () => {
      $('#picker_color_mode').classList.remove('category_selected');
      $('#solid_color_mode').classList.add('category_selected');
      $('#solid_color_items').style.display = 'flex';
      $('#picker_color_items').style.display = 'none';
      openPickerView = 'none';
    };

    const pickerColorEvent = () => {
      $('#solid_color_items').style.display = 'none';
      $('#picker_color_items').style.display = 'flex';
      $('#solid_color_mode').classList.remove('category_selected');
      $('#picker_color_mode').classList.add('category_selected');
      $('#picker_color_items').style.marginTop = '8px';
      openTextPickerView = 'block';
    };

    const solidTextColorEvent = () => {
      $('#picker_color_text_mode').classList.remove('category_selected');
      $('#solid_color_text_mode').classList.add('category_selected');
      $('#solid_color_items_text').style.display = 'flex';
      $('#picker_color_items_text').style.display = 'none';
      openPickerView = 'none';
    };

    const pickerTextColorEvent = () => {
      $('#solid_color_items_text').style.display = 'none';
      $('#picker_color_items_text').style.display = 'flex';
      $('#solid_color_text_mode').classList.remove('category_selected');
      $('#picker_color_text_mode').classList.add('category_selected');
      $('#picker_color_items_text').style.marginTop = '8px';
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
      $('#picker_color_text_modeBG').classList.remove('category_selected');
      $('#solid_color_text_modeBG').classList.add('category_selected');

      $('#bg_solid_color_items_text').style.display = 'flex';
      $('#bg_picker_color_items_text').style.display = 'none';
      openPickerViewBG = 'none';
    };

    const pickerTextColorEventBG = () => {
      $('#bg_solid_color_items_text').style.display = 'none';
      $('#bg_picker_color_items_text').style.display = 'flex';

      $('#solid_color_text_modeBG').classList.remove('category_selected');
      $('#picker_color_text_modeBG').classList.add('category_selected');

      $('#bg_picker_color_items_text').style.marginTop = '8px';
      openPickerViewBG = 'block';
    };

    solidTextColorEventBG();

    $('#solid_color_text_modeBG').addEventListener('click', () => {
      solidTextColorEventBG();
    });

    $('#picker_color_text_modeBG').addEventListener('click', () => {
      pickerTextColorEventBG();
    });

    [('#R_BG', '#G_BG', '#B_BG')].forEach((id) => {
      $(id).addEventListener('input', () => {
        const r = $('#R_BG').value;
        const g = $('#G_BG').value;
        const b = $('#B_BG').value;
        colorPickerBG.color.rgb = { r, g, b };
        const bgColor = colorPickerBG.color.hexString;
        this.canvas.setBackgroundColor(bgColor);
        this.canvas.requestRenderAll();
      });
    });

    ['#H_BG', '#S_BG', '#L_BG'].forEach((id) => {
      $(id).addEventListener('input', () => {
        const h = $('#H_BG').value;
        const s = $('#S_BG').value;
        const l = $('#L_BG').value;
        colorPickerBG.color.hsl = { h, s, l };
        const bgColor = colorPickerBG.color.hexString;
        this.canvas.setBackgroundColor(bgColor);
        this.canvas.requestRenderAll();
      });
    });

    $('#HEX_BG').addEventListener('input', (e) => {
      let inputCountBG = 0;
      let inputValue = e.target.value;

      if (inputValue.length > 0 && inputValue[0] !== '#') {
        if (inputValue.length >= 3) {
          inputValue = '#' + inputValue;
          $('#HEX_BG').value = inputValue;
          inputCountBG = 0;
        } else {
          inputCountBG++;
        }
      }

      const r = $('#R_BG').value;
      const g = $('#G_BG').value;
      const b = $('#B_BG').value;
      colorPickerBG.color.rgb = { r, g, b };

      const h = $('#H_BG').value;
      const s = $('#S_BG').value;
      const l = $('#L_BG').value;
      colorPickerBG.color.hsl = { h, s, l };

      colorPickerBG.color.set(inputValue);
      this.canvas.setBackgroundColor(colorPickerBG.color.hexString);

      this.canvas.requestRenderAll();
    });

    function handleColorModeClickBG(activeElement, element1, element2) {
      $(element1 + '_view_BG').classList.remove('color_mode_title-active');
      $(element1 + '_view_BG').style.display = 'none';

      $(element2 + '_view_BG').classList.remove('color_mode_title-active');
      $(element2 + '_view_BG').style.display = 'none';

      $(activeElement + '_view_BG').classList.add('color_mode_title-active');
      $(activeElement + '_view_BG').style.display = 'flex';
    }

    $('#HSL_mode_BG').addEventListener('click', () => {
      handleColorModeClickBG('#HSL', '#RGB', '#HEX');
    });

    $('#RGB_mode_BG').addEventListener('click', () => {
      handleColorModeClickBG('#RGB', '#HSL', '#HEX');
    });

    $('#HEX_mode_BG').addEventListener('click', () => {
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

        $('#H_BG').value = hsl.h;
        $('#S_BG').value = hsl.s;
        $('#L_BG').value = hsl.l;
        $('#R_BG').value = rgb.r;
        $('#G_BG').value = rgb.g;
        $('#B_BG').value = rgb.b;

        $('#HEX_BG').value = color.hexString;
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

    $('#custom_color_generator').addEventListener('change', (e) => {
      const color = e.target.value;

      const newColor = document.createElement('input');
      newColor.setAttribute('type', 'color');
      newColor.setAttribute('value', color);
      newColor.className = 'color-picker';
      newColor.style.width = '32px';
      newColor.style.height = '32px';
      newColor.style.borderColor = color;

      newColor.addEventListener('input', () => {
        const activeObj = this.canvas.getActiveObject();
        activeObj.set('fill', color);
        this.canvas.requestRenderAll();
      });

      $('#custom_colors_wrapper').append(newColor);
    });

    $('#custom_text_color_generator').addEventListener('change', (e) => {
      const color = e.target.value;

      const newColor = document.createElement('input');
      newColor.setAttribute('type', 'color');
      newColor.setAttribute('value', color);
      newColor.className = 'color-picker';
      newColor.style.width = '32px';
      newColor.style.height = '32px';
      newColor.style.borderColor = color;

      newColor.addEventListener('input', () => {
        const activeObj = this.canvas.getActiveObject();
        activeObj.set('fill', color);
        this.canvas.requestRenderAll();
      });

      $('#custom_text_colors_wrapper').append(newColor);
    });

    document.querySelectorAll('#solid_color').forEach((item) => {
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

              const logoColorPickers = document.querySelectorAll('#color-layers-pickers');
              logoColorPickers.forEach((i) => i.remove());
              updateColorPickers();
              this.canvas.requestRenderAll();
            }
          }
        }
      });
      captureCanvasState();
      this.canvas.requestRenderAll();
    });

    document.querySelectorAll('#solid_color2').forEach((item) => {
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
              this.canvas.requestRenderAll();
            }
          }
        }
      });
      captureCanvasState();
      this.canvas.requestRenderAll();
    });

    document.querySelectorAll('#solid_color-bg').forEach((item) => {
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
            captureCanvasState();

            const logoColorPickers = document.querySelectorAll('#color-layers-pickers');
            logoColorPickers.forEach((i) => i.remove());
            updateColorPickers();
            this.canvas.requestRenderAll();
          }
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

        // if (item && item.text) {
        //   textPalette?.appendChild(colPicker);
        // } else {
        //   colorPalette?.appendChild(colPicker);
        // }
      });
      captureCanvasState();
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

        $('#H2').value = hsl.h;
        $('#S2').value = hsl.s;
        $('#L2').value = hsl.l;
        $('#R2').value = rgb.r;
        $('#G2').value = rgb.g;
        $('#B2').value = rgb.b;

        $('#HEX2').value = color.hexString;
      }

      const active = this.canvas.getActiveObject();
      active.set('fill', color.rgbaString);
      this.canvas.requestRenderAll();

      const logoColorPickers = document.querySelectorAll('#color-layers-pickers');
      logoColorPickers.forEach((i) => i.remove());
      updateColorPickers();
      this.canvas.requestRenderAll();
    };

    colorPickerText.on('input:change', changeColorPickerText);
    colorPickerText.on('input:move', changeColorPickerText);

    function handleColorModeClick(activeElement, element1, element2) {
      $(element1 + '_view').classList.remove('color_mode_title-active');
      $(element1 + '_view').style.display = 'none';

      $(element2 + '_view').classList.remove('color_mode_title-active');
      $(element2 + '_view').style.display = 'none';

      $(activeElement + '_view').classList.add('color_mode_title-active');
      $(activeElement + '_view').style.display = 'flex';
    }

    $('#HSL_mode').addEventListener('click', () => {
      handleColorModeClick('#HSL', '#RGB', '#HEX');
    });

    $('#RGB_mode').addEventListener('click', () => {
      handleColorModeClick('#RGB', '#HSL', '#HEX');
    });

    $('#HEX_mode').addEventListener('click', () => {
      handleColorModeClick('#HEX', '#RGB', '#HSL');
    });

    handleColorModeClick('#HEX', '#RGB', '#HSL');

    function handleColorModeClick(activeElement, element1, element2) {
      $(element1 + '_view').classList.remove('color_mode_title-active');
      $(element1 + '_view').style.display = 'none';

      $(element2 + '_view').classList.remove('color_mode_title-active');
      $(element2 + '_view').style.display = 'none';

      $(activeElement + '_view').classList.add('color_mode_title-active');
      $(activeElement + '_view').style.display = 'flex';
    }

    $('#HSL2_mode').addEventListener('click', () => {
      handleColorModeClick('#HSL2', '#RGB2', '#HEX2');
    });

    $('#RGB2_mode').addEventListener('click', () => {
      handleColorModeClick('#RGB2', '#HSL2', '#HEX2');
    });

    $('#HEX2_mode').addEventListener('click', () => {
      handleColorModeClick('#HEX2', '#RGB2', '#HSL2');
    });

    handleColorModeClick('#HEX2', '#RGB2', '#HSL2');

    const centerAndResizeElements = (
      type,
      logoSize,
      sloganSize,
      textPosition,
      mainTop = -100,
      sloganTop,
      logoNameTop
    ) => {
      // this.canvas.remove(line1, line2);
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
            // newGrp.set('top', mainTop);
            newGrp.ungroupOnCanvas();
            updatePreview();
            this.canvas.requestRenderAll();
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

            logoNameElement.set('top', this.canvas.height / 5);
            sloganNameElement.set('top', this.canvas.height / 3.5);

            const newGrp = new fabric.Group(objects);
            this.canvas.viewportCenterObject(newGrp);
            // newGrp.set('top', mainTop);
            newGrp.ungroupOnCanvas();
            updatePreview();
            this.canvas.requestRenderAll();
          }, timeout);
          break;
        case 'leftRight':
          setTimeout(() => {
            const logoNameElement = objects.find(
              (obj) => obj.type === 'text' && obj.text.toLowerCase() === 'my brand name'
            );

            const sloganNameElement = objects.find(
              (obj) => obj.type === 'text' && obj.text === 'Slogan goes here'
            );
            logoNameElement.center();
            sloganNameElement.center();

            logoNameElement.set('top', this.canvas.height / 2.3);
            sloganNameElement.set('top', this.canvas.height / 1.9);

            logoNameElement.set('fontSize', 46);
            sloganNameElement.set('fontSize', 22);

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

            logoMain.forEach((i) => (i.left -= 200));
            const newGrp = new fabric.Group(objects);
            this.canvas.viewportCenterObjectH(newGrp);
            this.canvas.viewportCenterObjectV(newGrp);
            // newGrp.set('top', mainTop);
            newGrp.ungroupOnCanvas();
            updatePreview();
            this.canvas.requestRenderAll();
          }, timeout);
          break;
        case 'rightLeft':
          setTimeout(() => {
            const logoNameElement = objects.find(
              (obj) => obj.type === 'text' && obj.text.toLowerCase() === 'my brand name'
            );

            const sloganNameElement = objects.find(
              (obj) => obj.type === 'text' && obj.text === 'Slogan goes here'
            );
            logoNameElement.center();
            sloganNameElement.center();

            logoNameElement.set('top', this.canvas.height / 2.3);
            sloganNameElement.set('top', this.canvas.height / 1.9);

            logoNameElement.set('fontSize', 46);
            sloganNameElement.set('fontSize', 22);

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
            // newGrp.set('top', mainTop);
            newGrp.ungroupOnCanvas();
            updatePreview();
            this.canvas.requestRenderAll();
          }, timeout);
          break;
      }
      this.canvas.requestRenderAll();
      captureCanvasState();
      // this.canvas.add(line1, line2);
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

    $('#canvas-bg-none').addEventListener('click', () => {
      this.canvas.setBackgroundColor(this.canvasBG);
      this.canvas.requestRenderAll();
      captureCanvasState();
    });

    const discardSelectionForAlignments = () => {
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    };

    scaleLogo(200);
    centerAndResizeElements('topBottom', 46, 22, 'center', 150, 1.32, 1.5);

    $('#top_bottom_1').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('topBottom', 46, 22, 'center', 150, 1.32, 1.5);
    });

    $('#top_bottom_2').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('topBottom', 40, 20, 'center', 150, 1.35, 1.52);
    });

    $('#top_bottom_3').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(160);
      centerAndResizeElements('topBottom', 46, 22, 'center', 150, 1.42, 1.6);
    });

    $('#bottom_top_1').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('bottomTop', 46, 22, 'center', 150, 1.32, 1.5);
    });

    $('#bottom_top_2').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('bottomTop', 40, 18, 'center', 150, 1.35, 1.5);
    });

    $('#bottom_top_3').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(160);
      centerAndResizeElements('bottomTop', 46, 22, 'center', 150, 1.32, 1.5);
    });

    $('#left_right_1').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('leftRight', 32, 25, 'center', 200, 1.32, 1.5);
    });

    $('#left_right_2').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('leftRight', 32, 25, 'left', 200, 1.32, 1.5);
    });

    $('#left_right_3').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(160);
      centerAndResizeElements('leftRight', 32, 25, 'left', 200, 1.32, 1.5);
    });

    $('#right_left_1').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('rightLeft', 32, 25, 'center', 200, 1.32, 1.5);
    });

    $('#right_left_2').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(160);
      centerAndResizeElements('rightLeft', 32, 25, 'left', 210, 1.32, 1.5);
    });

    $('#right_left_3').addEventListener('click', () => {
      discardSelectionForAlignments();
      scaleLogo(200);
      centerAndResizeElements('rightLeft', 32, 25, 'left', 200, 1.32, 1.5);
    });
  }
}

const editorScreen = new EditorScreen();
editorScreen.initialize();
