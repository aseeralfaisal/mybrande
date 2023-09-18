import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import './style.css';

const $ = (id) => document.querySelector(id);

$('#details_view').style.display = 'none';
$('#main_editor_view').style.display = 'none';
const imgViewContainer = $('#img-view-container');
const imgView = $('#img-view');
const dragDrop = $('#drag-drop');
const dragDropChild = $('#drag-drop-child');
const cropElement = $('#crop');
const nextBtn = $('#next_btn');
const backBtn = $('#back-main');

const fileReader = new FileReader();

const preventEvents = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

const uploadLocalFile = (file) => {
  
  imgViewContainer.style.display = 'block';
  imgView.style.display = 'block';
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
};

dragDrop.addEventListener('dragover', preventEvents);

dragDrop.addEventListener('drop', (event) => {
  preventEvents(event);
  uploadLocalFile(event.dataTransfer.files[0]);
});

$('#upload_file_btn').addEventListener('change', (event) => {
  preventEvents(event);
  uploadLocalFile(event.target.files[0]);
});

imgViewContainer.style.display = 'none';
imgView.style.display = 'none';

const dragDropEvent = (event, background, borderColor, borderWidth, height, width) => {
  preventEvents(event)
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

nextBtn.addEventListener('click', () => {
  $('#drag_drop_view').style.display = 'none';
  $('#main_editor_view').style.display = 'block';
  $('#details_view').style.display = 'none';
});

backBtn.addEventListener('click', () => {
  $('#drag_drop_view').style.display = 'block';
  $('#main_editor_view').style.display = 'none';
  $('#details_view').style.display = 'none';
});

let cropper;
imgView.onload = () => {
  cropper = new Cropper(imgView, {
    aspectRatio: 1 / 1,
  });
};

cropElement &&
  cropElement?.addEventListener('click', () => {
    const croppedImage = cropper.getCroppedCanvas().toDataURL('image/png');
    $('#imger').src = croppedImage;
  });
