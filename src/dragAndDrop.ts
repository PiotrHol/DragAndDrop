const dragAndDropZone = "drag-and-drop-zone";
const defaultDraggingClass = "dragging-item";

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
  private draggingClass: string;

  constructor(dragAndDropListSelector: HTMLElement) {
    this.dragAndDropListSelector = dragAndDropListSelector;
    this.isInit = false;
    this.dragAndDropItems = Array.from(
      this.dragAndDropListSelector.children
    ) as HTMLElement[];
    this.draggingItem = null;
    this.draggingClass = dragAndDropListSelector.dataset.draggingClass
      ? dragAndDropListSelector.dataset.draggingClass
      : defaultDraggingClass;
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
        dndItem.addEventListener("dragend", () => this.dragEndHandler(dndItem));
      });
    }
  }

  dragStartHandler(item: HTMLElement) {
    this.draggingItem = item;
    item.classList.add(this.draggingClass);
  }

  dragOverHandler(e: Event) {
    const event = e as DragEvent;
    event.preventDefault();
    this.dragAndDropItems = Array.from(
      this.dragAndDropListSelector.children
    ) as HTMLElement[];
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

  dragEndHandler(item: HTMLElement) {
    item.classList.remove(this.draggingClass);
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
