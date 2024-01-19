import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';


export const toastNotification = (text) => {
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


