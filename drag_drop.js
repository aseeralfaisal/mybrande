import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import './style.css';

document.getElementById('main_editor_view').style.display = 'none';
const imgViewContainer = document.querySelector('#img-view-container');
const imgView = document.getElementById('img-view');
const dragDrop = document.querySelector('#drag-drop');
const dragDropChild = document.querySelector('#drag-drop-child');

const fileReader = new FileReader();

dragDrop.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

dragDrop.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();

  imgViewContainer.style.display = 'block';
  imgView.style.display = 'block';

  let file = e.dataTransfer.files[0];
  if (file.type !== 'image/svg+xml') {
    file = null;
    alert('Please use an SVG file instead');
    imgViewContainer.style.display = 'none';
  }

  fileReader.readAsText(file);
  fileReader.onloadend = () => {
    const svgContent = fileReader.result;
    localStorage.setItem('logo-file', svgContent);
  };

  dragDropChild.style.display = 'none';
  const fileURL = URL.createObjectURL(file);
  imgView.src = fileURL;
});

imgViewContainer.style.display = 'none';
imgView.style.display = 'none';

const dragDropEvent = (event, background, borderColor, borderWidth, height, width) => {
  event.preventDefault();
  event.stopPropagation();
  dragDrop.style.background = background;
  dragDrop.style.borderColor = borderColor;
  dragDrop.style.borderWidth = borderWidth;
  dragDrop.style.height = height;
  dragDrop.style.width = width;
};

dragDrop.addEventListener('dragover', (event) => {
  return dragDropEvent(event, '#eeeeee77', '#4d4e4eaa', '6px', '500px', '550px');
});

dragDrop.addEventListener('dragleave', (event) => {
  return dragDropEvent(event, '#ffffff', '#4d4e4e55', '3px', '500px', '550px');
});

const nextBtn = document.querySelector('#next_btn');
nextBtn.addEventListener('click', () => {
  document.getElementById('drag_drop_view').style.display = 'none';
  document.getElementById('main_editor_view').style.display = 'block';
  document.getElementById('details_view').style.display = 'none';
});
const backBtn = document.querySelector('#back-main');
backBtn.addEventListener('click', () => {
  document.getElementById('drag_drop_view').style.display = 'block';
  document.getElementById('main_editor_view').style.display = 'none';
  document.getElementById('details_view').style.display = 'none';
});

let cropper;
imgView.onload = () => {
  cropper = new Cropper(imgView, {
    aspectRatio: 1 / 1,
  });
};
const cropElem = document.getElementById('crop');
cropElem &&
  cropElem?.addEventListener('click', () => {
    const croppedImage = cropper.getCroppedCanvas().toDataURL('image/png');
    console.log(croppedImage);
    document.querySelector('#imger').src = croppedImage;
  });
