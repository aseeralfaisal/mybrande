import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import './style.css';

const $ = (id) => document.querySelector(id);
const fileReader = new FileReader();

const elements = {
  detailsView: $('#details_view'),
  mainEditorView: $('#main_editor_view'),
  imgViewContainer: $('#img-view-container'),
  imgView: $('#img-view'),
  dragDrop: $('#drag-drop'),
  dragDropChild: $('#drag-drop-child'),
  // cropElement: $('#crop'),
  dragDropView: $('#drag_drop_view'),
  nextBtn: $('#next_btn'),
  backBtn: $('#back-main'),
  uploadFileBtn: $('#upload_file_btn'),
  // imger: $('#imger'),
};

let editCounterLocal = localStorage.getItem('mainEditorCounter');
if (editCounterLocal > 0) {
  elements.detailsView.style.display = 'none';
  elements.mainEditorView.style.display = 'block';
  elements.dragDropView.style.display = 'none';
} else {
  elements.mainEditorView.style.display = 'none';
  elements.detailsView.style.display = 'none';
}

const preventEvents = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

const uploadLocalFile = (file) => {
  elements.imgViewContainer.style.display = 'block';
  elements.imgView.style.display = 'block';

  if (file.type !== 'image/svg+xml') {
    file = null;
    alert('Please use an SVG file instead');
    elements.imgViewContainer.style.display = 'none';
    return;
  }

  fileReader.readAsText(file);
  fileReader.onloadend = () => {
    const svgContent = fileReader.result;
    localStorage.setItem('logo-file', svgContent);
    localStorage.setItem('mainEditorCounter', 0);
  };

  elements.dragDropChild.style.display = 'none';
  const fileURL = URL.createObjectURL(file);
  elements.imgView.src = fileURL;
};

elements.dragDrop.addEventListener('dragover', preventEvents);

elements.dragDrop.addEventListener('drop', (event) => {
  preventEvents(event);
  uploadLocalFile(event.dataTransfer.files[0]);
});

elements.uploadFileBtn.addEventListener('change', (event) => {
  preventEvents(event);
  uploadLocalFile(event.target.files[0]);
});

elements.imgViewContainer.style.display = 'none';
elements.imgView.style.display = 'none';

const dragDropEvent = (event, background, borderColor, borderWidth, height, width) => {
  preventEvents(event);
  elements.dragDrop.style.background = background;
  elements.dragDrop.style.borderColor = borderColor;
  elements.dragDrop.style.borderWidth = borderWidth;
  elements.dragDrop.style.height = height;
  elements.dragDrop.style.width = width;
};

elements.dragDrop.addEventListener('dragover', (event) => {
  dragDropEvent(event, '#eeeeee77', '#4d4e4eaa', '6px', '500px', '550px');
});

elements.dragDrop.addEventListener('dragleave', (event) => {
  dragDropEvent(event, '#ffffff', '#4d4e4e55', '3px', '500px', '550px');
});

elements.nextBtn.addEventListener('click', () => {
  localStorage.setItem('mainEditorCounter', 1);
  location.reload();
});

elements.backBtn.addEventListener('click', () => {
  elements.detailsView.style.display = 'none';
  elements.mainEditorView.style.display = 'none';
  elements.dragDropView.style.display = 'block';
});

// let cropper;
// elements.imgView.onload = () => {
//   cropper = new Cropper(elements.imgView, {
//     aspectRatio: 1 / 1,
//   });
// };

// function convertPngToSvg(dataUrl) {
//   const svgNS = 'http://www.w3.org/2000/svg';

//   const svg = document.createElementNS(svgNS, 'svg');

//   const svgImage = document.createElementNS(svgNS, 'image');

//   svgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', dataUrl);

//   svg.appendChild(svgImage);

//   const serializer = new XMLSerializer();
//   const svgString = serializer.serializeToString(svg);

//   return svgString;
// }

// elements.cropElement?.addEventListener('click', () => {
//   const croppedImage = cropper.getCroppedCanvas().toDataURL('image/png');
//   const svgContent = convertPngToSvg(croppedImage)
//   localStorage.setItem('logo-file', svgContent);
//   elements.imger.src = croppedImage;
// });
