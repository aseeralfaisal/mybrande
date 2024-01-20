
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
