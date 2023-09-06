const $ = (id) => document.querySelector(id);

class StarterScreen {
  constructor() {
    this.logoNameInput = $('#logo_name_input-primary');
    this.sloganInput = $('#logo_name_input-secondary');
    this.nextBtn = $('#next_btn');
    this.backBtn = $('#back_btn');
    this.dragDrop = document.getElementById('drag-drop');
    this.dragDropChild = $('#drag-drop-child');
    this.imgViewContainer = $('#img-view-container');
    this.imgView = $('#img-view');
    this.nextDragDropBtn = $('#d_next_btn');
    this.dragDropParent = $('#darg-drop-parent');
    this.inputPhase = $('#input_phase');
    this.pageCounter = 1;
    this.EDITOR_PAGE_NO = 3;
    this.logoNameInputVal = '';
    this.sloganInputVal = '';
    this.fileReader = new FileReader();

    this.resizeSVG = (svgContent, width, height) => {
      const parser = new DOMParser();
      const svgDOM = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDOM.documentElement;
      svgElement.setAttribute('width', width);
      svgElement.setAttribute('height', height);
      const serializer = new XMLSerializer();
      const resizedSVGContent = serializer.serializeToString(svgElement);
      return resizedSVGContent;
    };

    this.dragDropEvent = (event, background, borderColor, borderWidth, height, width) => {
      event.preventDefault();
      event.stopPropagation();
      this.dragDrop.style.background = background;
      this.dragDrop.style.borderColor = borderColor;
      this.dragDrop.style.borderWidth = borderWidth;
      this.dragDrop.style.height = height;
      this.dragDrop.style.width = width;
    };
  }

  initialize() {
    this.inputPhase.style.display = 'none';
    this.sloganInput.style.display = 'none';

    this.logoNameInput.addEventListener('input', (event) => {
      this.logoNameInputVal = event.target.value;
      localStorage.setItem('logo_name', this.logoNameInputVal);
    });

    this.sloganInput.addEventListener('input', (event) => {
      this.sloganInputVal = event.target.value;
      localStorage.setItem('slogan_name', this.sloganInputVal);
    });

    this.logoNameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.nextBtn.click();
      }
    });

    this.sloganInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.nextBtn.click();
      }
    });

    const nextEvent = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.logoNameInput.style.display = 'none';
      this.sloganInput.style.display = 'block';
      this.backBtn.style.display = 'inline';
      if (this.pageCounter === this.EDITOR_PAGE_NO) {
        const logoNameLocal = localStorage.getItem('logo_name');
        const sloganNameLocal = localStorage.getItem('slogan_name');
        if (sloganNameLocal && logoNameLocal) {
          location.href = `/pages/editor.html?logo_name=${logoNameLocal}&slogan_name=${sloganNameLocal}`;
        } else {
          location.href = `/pages/editor.html?logo_name=${this.logoNameInputVal}&slogan_name=${this.sloganInputVal}`;
        }
      }

      this.pageCounter++;
    };

    this.nextBtn.addEventListener('click', nextEvent);

    this.backBtn.addEventListener('click', () => {
      if (this.pageCounter === 2) {
        this.inputPhase.style.display = 'none';
        this.dragDropParent.style.display = 'block';
      } else {
        this.logoNameInput.style.display = 'block';
        this.sloganInput.style.display = 'none';
      }

      this.pageCounter--;
    });

    this.imgViewContainer.style.display = 'none';
    this.imgView.style.display = 'none';

    this.dragDrop.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.imgViewContainer.style.display = 'block';
      this.imgView.style.display = 'block';

      let file = e.dataTransfer.files[0];
      if (file.type !== 'image/svg+xml') {
        file = null;
        alert('Please use an SVG file instead');
        this.imgViewContainer.style.display = 'none';
      }

      this.fileReader.readAsText(file);
      this.fileReader.onloadend = () => {
        const svgContent = this.fileReader.result;
        // const resizedSVGContent = this.resizeSVG(svgContent, 400, 400);
        localStorage.setItem('logo-file', svgContent);
      };

      this.dragDropChild.style.display = 'none';
      const fileURL = URL.createObjectURL(file);
      this.imgView.src = fileURL;
    });

    this.dragDrop.addEventListener('dragover', (event) => {
      return this.dragDropEvent(event, '#eeeeee77', '#4d4e4eaa', '6px', '393px', '437px');
    });

    this.dragDrop.addEventListener('dragleave', (event) => {
      return this.dragDropEvent(event, '#ffffff', '#4d4e4e55', '3px', '400px', '444px');
    });

    this.dragDrop.addEventListener('drop', (e) => {
      return this.dragDropEvent(event, '#ffffff', '#4d4e4e55', '3px', '400px', '444px');
    });

    this.nextDragDropBtn.addEventListener('click', () => {
      this.dragDropParent.style.display = 'none';
      this.inputPhase.style.display = 'block';
      this.pageCounter++;
    });
  }
}

const starterScreen = new StarterScreen();
starterScreen.initialize();
