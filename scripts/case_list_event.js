

function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

function toSentenceCase(str) {
  const stack = [];
  stack.push(str[0].toUpperCase());
  for (let i = 1; i < str.length; i++) {
    stack.push(str[i].toLowerCase());
  }
  return stack.join('');
};

function handleTextTransformation(selectedTextElement, active) {
  const text = active?.text;

  if (selectedTextElement === 'Uppercase') {
    active.text = text.toUpperCase();
  } else if (selectedTextElement === 'Lowercase') {
    active.text = text.toLowerCase();
  } else if (selectedTextElement === 'Title Case') {
    active.text = toTitleCase(text);
  } else if (selectedTextElement === 'Sentence Case') {
    active.text = toSentenceCase(text);
  }
}

export function handleCaseListClick(event) {
  const selectedTextElement = event.target.innerText;
  const active = this.canvas.getActiveObject();
  const currCoordinate = active.getCenterPoint();

  const existingFont = active.get('fontFamily');
  const existingFill = active.get('fill');
  const existingSelectable = active.get('selectable');
  const HasRotatingPoint = active.get('hasRotatingPoint');
  const existingDiameter = active.get('diameter');
  const existingLeft = active.get('left');
  const existingTop = active.get('top');
  const existingFlipped = active.get('flipped');
  const existingFontSize = active.get('fontSize');

  active.set('fontSize', 40);
  handleTextTransformation(selectedTextElement, active);

  active.set('fontFamily', existingFont);
  active.set('fill', existingFill);
  active.set('selectable', existingSelectable);
  active.set('hasRotatingPoint', HasRotatingPoint);
  active.set('diameter', existingDiameter);
  active.set('left', existingLeft);
  active.set('top', existingTop);
  active.set('flipped', existingFlipped);
  active.set('fontSize', existingFontSize);

  active.setPositionByOrigin(new fabric.Point(currCoordinate.x, currCoordinate.y), 'center', 'center');
  active.setCoords();
  this.canvas.renderAll();

  this.caseListTitle.innerText = selectedTextElement;
  const icon = document.createElement('i');
  icon.className = 'fa-solid fa-angle-down';
  this.caseListTitle.append(icon);
  this.caseList.classList.remove('show');
}
