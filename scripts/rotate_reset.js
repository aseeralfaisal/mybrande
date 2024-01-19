export function rotateReset(active) {
  if (active) {
    if (active._objects) {
      const groupObjects = active?.getObjects();

      groupObjects.forEach((object) => {
        const currCoordinate = object.getCenterPoint();
        object.set('angle', 0);
        object.set('matrix', [1, 0, 0, 1, 0, 0]);
        object.set({
          originX: 'center',
          originY: 'center',
        });
        object.setPositionByOrigin(
          new fabric.Point(currCoordinate.x, currCoordinate.y),
          'center',
          'center'
        );
      });

      const groupCenter = active.getCenterPoint();
      active.setPositionByOrigin(new fabric.Point(groupCenter.x, groupCenter.y), 'center', 'center');
    } else {
      const currCoordinate = active.getCenterPoint();
      active.set('angle', 0);
      active.set('matrix', [1, 0, 0, 1, 0, 0]);
      active.set({
        originX: 'center',
        originY: 'center',
      });
      active.setPositionByOrigin(
        new fabric.Point(currCoordinate.x, currCoordinate.y),
        'center',
        'center'
      );
    }
  }
}
