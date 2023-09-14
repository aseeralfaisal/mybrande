export class DeleteLayer {
  constructor(event, canvas, layers, activeLayerIndex) {
    this.event = event;
    this.canvas = canvas;
    this.layers = layers;
    this.activeLayerIndex = activeLayerIndex;
  }

  deleteLayer() {
    const selectedObject = this.canvas.getActiveObject();
    if (this.event.key === 'Delete') {
      if (this.layers.children.length === 1) {
        this.layers.removeChild(this.layers.firstChild);
        this.canvas.clear();
      } else {
        this.layers?.children[this.activeLayerIndex]?.remove();
        this.canvas?.remove(selectedObject);
        if (this.activeLayerIndex === this.layers.children.length - 1) {
          this.activeLayerIndex = 0;
        } else {
          document.querySelectorAll('.layer-container').forEach((layer) => {
            const layerIndex = parseInt(layer.getAttribute('data_layer'));
            if (layerIndex > this.activeLayerIndex) {
              layer.setAttribute('data_layer', layerIndex - 1);
            }
          });
        }
        this.canvas.setActiveObject(this.canvas.item(this.activeLayerIndex));
        this.canvas.requestRenderAll();
      }
    }
  }
}
