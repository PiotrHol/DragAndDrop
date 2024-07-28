const dragAndDropZone = "drag-and-drop-zone";

interface DnD {
  init: () => void;
}

class DragAndDrop implements DnD {
  private dragAndDropSelector;
  private isInit: boolean;

  constructor(dragAndDropSelector: HTMLElement) {
    this.dragAndDropSelector = dragAndDropSelector;
    this.isInit = false;
  }

  init() {
    if (!this.isInit) {
      this.isInit = true;
    }
  }
}

const nodeDragAndDropContainers: NodeListOf<HTMLElement> =
  document.querySelectorAll(`.${dragAndDropZone}`);

const dragAndDropContainers: DragAndDrop[] = [];

for (let i = 0; i < nodeDragAndDropContainers.length; i++) {
  dragAndDropContainers.push(new DragAndDrop(nodeDragAndDropContainers[i]));
  dragAndDropContainers[dragAndDropContainers.length - 1].init();
}
