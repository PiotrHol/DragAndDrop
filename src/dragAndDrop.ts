const dragAndDropZone = "drag-and-drop-zone";

interface DnD {
  init: () => void;
  dragStartHandler: (element: HTMLElement) => void;
  dragOverHandler: (e: Event) => void;
  dragEndHandler: (element: HTMLElement) => void;
}

class DragAndDrop implements DnD {
  private dragAndDropSelector: HTMLElement;
  private isInit: boolean;
  private dragAndDropItems: HTMLCollection;
  private draggingItem: HTMLElement | null;

  constructor(dragAndDropSelector: HTMLElement) {
    this.dragAndDropSelector = dragAndDropSelector;
    this.isInit = false;
    this.dragAndDropItems = this.dragAndDropSelector.children;
    this.draggingItem = null;
  }

  init() {
    if (!this.isInit) {
      this.isInit = true;
      for (let i = 0; i < this.dragAndDropItems.length; i++) {
        this.dragAndDropItems[i].setAttribute("draggable", "true");
        this.dragAndDropItems[i].addEventListener("dragstart", () =>
          this.dragStartHandler(<HTMLElement>this.dragAndDropItems[i])
        );
        this.dragAndDropItems[i].addEventListener("dragover", (e: Event) =>
          this.dragOverHandler(e)
        );
        this.dragAndDropItems[i].addEventListener("dragend", () =>
          this.dragEndHandler(<HTMLElement>this.dragAndDropItems[i])
        );
      }
    }
  }

  dragStartHandler(item: HTMLElement) {
    this.draggingItem = item;
    item.style.opacity = "0";
  }

  dragOverHandler(e: Event) {
    const event = e as DragEvent;
    event.preventDefault();
    const notDraggingItems = Array.from(this.dragAndDropItems).filter(
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

  dragEndHandler(item: HTMLElement) {
    this.draggingItem = null;
    item.style.opacity = "1";
  }
}

const nodeDragAndDropContainers: NodeListOf<HTMLElement> =
  document.querySelectorAll(`.${dragAndDropZone}`);

const dragAndDropContainers: DragAndDrop[] = [];

for (let i = 0; i < nodeDragAndDropContainers.length; i++) {
  dragAndDropContainers.push(new DragAndDrop(nodeDragAndDropContainers[i]));
  dragAndDropContainers[dragAndDropContainers.length - 1].init();
}
