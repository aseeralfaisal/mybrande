export const undo = (currIndex, canvas, captureCanvasState, undoHistory, logoNameElement, sloganNameElement) => {
  console.log(logoNameElement, sloganNameElement)
  if (currIndex > 0) {
    setCanvasBackground();
    currIndex -= 1;
    const stateToRestore = JSON.parse(undoHistory[currIndex]);
    canvas.clear();

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

    canvas.loadFromJSON(stateToRestore, () => {
      // const logoNameElement = canvas.getObjects().find((i) => i.text === 'My Brand Name');
      // const sloganNameElement = canvas.getObjects().find((i) => i.text === 'Slogan goes here');

      canvas.getObjects().forEach((item) => {
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
        canvas.requestRenderAll();
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
        canvas.requestRenderAll();
        updateActiveNavbar('text');

        this.logoSettingsContainer.style.display = 'none';
        this.textSettingsContainer.style.display = 'grid';
        this.backgroundSettingsContainer.style.display = 'none';
      });

      querySelectAll('#solid_color').forEach((item) => {
        item.addEventListener('click', (event) => {
          if (canvas) {
            const activeObj = canvas.getActiveObject();
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

                canvas.getObjects().forEach((item) => {
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
                      const active = canvas.getActiveObject();
                      active.set('fill', color);
                      canvas.requestRenderAll();
                    });
                  }
                });

                captureCanvasState();
                canvas.requestRenderAll();
                updatePreview();
              }
            }
          }
        });
      });

      querySelectAll('#solid_color_text').forEach((item) => {
        item.addEventListener('click', (event) => {
          const activeObj = canvas.getActiveObject();
          if (activeObj) {
            const bgColor = event.target.style.backgroundColor;
            const match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(bgColor);
            if (match) {
              const red = parseInt(match[1]);
              const green = parseInt(match[2]);
              const blue = parseInt(match[3]);
              const hexColor = convertRGBtoHex(red, green, blue);
              activeObj.set('fill', hexColor);

              canvas.requestRenderAll();
              captureCanvasState();
              updatePreview();
            }
          }
        });
      });
    });
  }
};

export const redo = (currIndex, canvas, _, undoHistory) => {
  if (currIndex < undoHistory.length - 1) {
    setCanvasBackground();
    currIndex += 1;
    const stateToRestore = JSON.parse(undoHistory[currIndex]);
    canvas.clear();

    canvas.loadFromJSON(stateToRestore, () => {
      canvas.requestRenderAll();
    });
  }
};


