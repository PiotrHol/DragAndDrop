const dragAndDropZone = "drag-and-drop-zone";

interface DnD {
  init: () => void;
  dragStartHandler: (element: HTMLElement) => void;
  dragOverHandler: (e: Event) => void;
  dragEndHandler: (element: HTMLElement) => void;
}

class DragAndDrop implements DnD {
  private dragAndDropListSelector: HTMLElement;
  private isInit: boolean;
  private dragAndDropItems: HTMLElement[];
  private draggingItem: HTMLElement | null;

  constructor(dragAndDropListSelector: HTMLElement) {
    this.dragAndDropListSelector = dragAndDropListSelector;
    this.isInit = false;
    this.dragAndDropItems = Array.from(
      this.dragAndDropListSelector.children
    ) as HTMLElement[];
    this.draggingItem = null;
  }

  init() {
    if (!this.isInit) {
      this.isInit = true;
      this.dragAndDropItems.forEach((dndItem) => {
        dndItem.setAttribute("draggable", "true");
        dndItem.addEventListener("dragstart", () =>
          this.dragStartHandler(dndItem)
        );
        dndItem.addEventListener("dragover", (e: Event) =>
          this.dragOverHandler(e)
        );
        dndItem.addEventListener("dragend", () => this.dragEndHandler());
      });
    }
  }

  dragStartHandler(item: HTMLElement) {
    this.draggingItem = item;
    item.style.opacity = "0";
  }

  dragOverHandler(e: Event) {
    const event = e as DragEvent;
    event.preventDefault();
    const notDraggingItems = this.dragAndDropItems.filter(
      (item) => item !== this.draggingItem
    ) as HTMLElement[];
    const nextItem = notDraggingItems.find((item) => {
      const notDraggingItemRect = item.getBoundingClientRect();
      return (
        event.clientY <=
        notDraggingItemRect.top + notDraggingItemRect.height / 2
      );
    }) as Node;
    this.draggingItem?.parentNode?.insertBefore(this.draggingItem, nextItem);
  }

  dragEndHandler() {
    if (this.draggingItem) {
      this.draggingItem.style.opacity = "1";
    }
    this.draggingItem = null;
  }
}

const nodeDragAndDropContainers: NodeListOf<HTMLElement> =
  document.querySelectorAll(`.${dragAndDropZone}`);

const dragAndDropContainers: DragAndDrop[] = [];

for (let i = 0; i < nodeDragAndDropContainers.length; i++) {
  dragAndDropContainers.push(new DragAndDrop(nodeDragAndDropContainers[i]));
  dragAndDropContainers[dragAndDropContainers.length - 1].init();
}
