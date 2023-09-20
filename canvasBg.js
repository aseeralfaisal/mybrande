import { editorElements } from "./editor.elements";

const setCanvasBackground = () => {
  editorElements.canvas.setBackgroundImage(
    '/static/pattern.png',
    editorElements.canvas.renderAll.bind(editorElements.canvas),
    {
      opacity: 0.6,
      originX: 'left',
      originY: 'top',
      top: 0,
      left: 0,
      scaleX: 0.3,
      scaleY: 0.3,
    }
  );
};

export { setCanvasBackground };
