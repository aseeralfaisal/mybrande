export class CreateLayerSection {
  constructor(layers) {
    this.layers = layers;
  }
  create(obj, idx) {
    const imgElem = document.createElement('img');
    imgElem.className = 'layer-img';
    imgElem.src = obj.toDataURL();
    const layerSpan = document.createElement('span');
    layerSpan.className = 'layer-span';
    layerSpan.textContent = `Layer ${idx + 1}`;
    const layerContainer = document.createElement('div');
    layerContainer.setAttribute('tabindex', '0');
    layerContainer.className = 'layer-container';
    layerContainer.setAttribute('data_layer', idx);
    layerContainer.append(imgElem, layerSpan);
    this.layers.append(layerContainer);
  }
}
