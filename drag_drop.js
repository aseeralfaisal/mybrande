import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import './style.css';
import axios from 'axios';
import Toastify from 'toastify-js';

const querySelect = (id) => document.querySelector(id);
const fileReader = new FileReader();

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

var logoMainFile;
const elements = {
  detailsView: querySelect('#details_view'),
  mainEditorView: querySelect('#main_editor_view'),
  imgViewContainer: querySelect('#img-view-container'),
  imgView: querySelect('#img-view'),
  dragDrop: querySelect('#drag-drop'),
  dragDropChild: querySelect('#drag-drop-child'),
  // cropElement: $('#crop'),
  dragDropView: querySelect('#drag_drop_view'),
  nextBtn: querySelect('#next_btn'),
  backBtn: querySelect('#back-main'),
  uploadFileBtn: querySelect('#upload_file_btn'),
  // imger: $('#imger'),
  inputPrimary: querySelect('#logo_name_input-primary'),
};

const preventEvents = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

let mainEditorCounter = localStorage.getItem('mainEditorCounter');
localStorage.setItem('mainEditorCounter', '3');
if (mainEditorCounter === '1') {
  elements.detailsView.style.display = 'none';
  elements.mainEditorView.style.display = 'block';
  elements.dragDropView.style.display = 'none';
} else if (mainEditorCounter === '3') {
  elements.dragDropView.style.display = 'none';
  elements.mainEditorView.style.display = 'none';
  elements.detailsView.style.display = 'block';
} else {
  elements.dragDropView.style.display = 'block';
  elements.mainEditorView.style.display = 'none';
  elements.detailsView.style.display = 'none';
}

const resizeSVG = (svgContent, width, height) => {
  const parser = new DOMParser();
  const svgDOM = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = svgDOM.documentElement;

  svgElement.setAttribute('width', width);
  svgElement.setAttribute('height', height);

  let viewBox = svgElement.getAttribute('viewBox').split(' ').map(Number);
  if (viewBox[2] > viewBox[3]) {
    viewBox[3] = (viewBox[2] / width) * height;
  } else {
    viewBox[2] = (viewBox[3] / height) * width;
  }
  svgElement.setAttribute('viewBox', viewBox.join(' '));

  const serializer = new XMLSerializer();
  const resizedSVGContent = serializer.serializeToString(svgElement);
  return resizedSVGContent;
};

const uploadLocalFile = (file) => {
  elements.imgViewContainer.style.display = 'block';
  elements.imgView.style.display = 'block';

  if (file.type !== 'image/svg+xml') {
    file = null;
    toastNotification('Please use an SVG file instead');
    elements.imgViewContainer.style.display = 'none';
    return;
  }

  fileReader.readAsText(file);
  fileReader.onloadend = () => {
    const svgContent = fileReader.result;
    const resizedSVGContent = resizeSVG(svgContent, 1000, 1000);
    logoMainFile = resizedSVGContent;
    localStorage.setItem('logo-file', resizedSVGContent);
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

let uploaded = false;
elements.uploadFileBtn.addEventListener('change', (event) => {
  preventEvents(event);
  uploadLocalFile(event.target.files[0]);
  uploaded = true;
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
  uploaded = true;
};

elements.dragDrop.addEventListener('dragover', (event) => {
  dragDropEvent(event, '#eeeeee77', '#4d4e4eaa', '6px', '500px', '550px');
});

elements.dragDrop.addEventListener('dragleave', (event) => {
  dragDropEvent(event, '#ffffff', '#4d4e4e55', '3px', '500px', '550px');
});

let logoNameExists = false;
elements.inputPrimary.addEventListener('input', (event) => {
  const val = event.target.value;
  if (val.length >= 1) {
    logoNameExists = true;
  }
});

let termsAccept = false;
elements.nextBtn.addEventListener('click', async () => {
  if (!termsAccept) return toastNotification('Please Accept the terms to continue');
  if (!uploaded) {
    toastNotification('Please upload an SVG file');
    localStorage.removeItem('mainEditorCounter');
    return location.reload();
  } else if (!logoNameExists) {
    return toastNotification('Please include a logo name');
  }
  const userId = querySelect('#logo_name_input-userId').value;
  if (!userId) return toastNotification('Invalid User');
  const apiUrl = `https://www.mybrande.com/api/logoname/store`;

  const response = await axios.post(apiUrl, {
    user_id: userId,
    logo_name: elements.inputPrimary.value,
    main_file: logoMainFile,
  });
  
  if (response.data.status === 500) {
    return toastNotification(response.data.message);
  } 
  
  if (response.status === 200) {
    const sellerLogoInfoId = response?.data?.seller_logoinfo_id;
    if (sellerLogoInfoId) {
      console.log(sellerLogoInfoId);
      localStorage.setItem('sellerLogoInfoId', sellerLogoInfoId);
    }
    localStorage.setItem('mainEditorCounter', '1');
    location.reload();
  }
});

querySelect('#terms-accept').addEventListener('click', () => {
  termsAccept = !termsAccept;
  if (termsAccept) {
    return querySelect('#terms-accept').classList.remove('btn-bordered');
  }
  return querySelect('#terms-accept').classList.add('btn-bordered');
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
