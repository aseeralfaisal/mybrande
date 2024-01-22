
export function getTextCase(text) {
  if (text === text.toUpperCase()) {
    return 'Uppercase';
  } else if (text === text.toLowerCase()) {
    return 'Lowercase';
  } else if (text === text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()) {
    return 'Sentence Case';
  } else {
    return 'Title Case';
  }
};

export function putAngleDownIcon(className, additionalFunction) {
  const icon = document.createElement('i');
  icon.className = 'fa-solid fa-angle-down';
  querySelect(className).append(icon);

  if (typeof additionalFunction === 'function') {
    icon.addEventListener('click', additionalFunction);
  }
};


export const setCanvasBackground = (canvas) => {
  canvas.setBackgroundImage('/static/pattern.png', canvas.renderAll.bind(canvas), {
    opacity: 0.6,
    originX: 'left',
    originY: 'top',
    top: 0,
    left: 0,
    scaleX: 0.3,
    scaleY: 0.3,
  });
};





