const defaultDraggingClass = "dragging-item";

interface DnD {
  init: () => void;
  dragStartHandler: (e: DragEvent, element: HTMLElement) => void;
  dragOverHandler: (e: DragEvent) => void;
  dragEndHandler: (e: DragEvent, element: HTMLElement) => void;
}

class DragAndDrop implements DnD {
  private dragAndDropListSelector: HTMLElement;
  private isInit: boolean;
  private dragAndDropItems: HTMLElement[];
  private draggingItem: HTMLElement | null;
  private draggingClass: string;
  private onDragStart: (e?: DragEvent) => void;
  private onDragOver: (e?: DragEvent) => void;
  private onDragEnd: (e?: DragEvent) => void;

  constructor(
    dragAndDropListSelector: HTMLElement,
    draggingClass: string,
    onDragStart: (e?: DragEvent) => void,
    onDragOver: (e?: DragEvent) => void,
    onDragEnd: (e?: DragEvent) => void
  ) {
    this.dragAndDropListSelector = dragAndDropListSelector;
    this.isInit = false;
    this.dragAndDropItems = Array.from(
      this.dragAndDropListSelector.children
    ) as HTMLElement[];
    this.draggingItem = null;
    this.draggingClass = draggingClass;
    this.onDragStart = onDragStart;
    this.onDragOver = onDragOver;
    this.onDragEnd = onDragEnd;
  }

  init() {
    if (!this.isInit) {
      this.isInit = true;
      this.dragAndDropItems.forEach((dndItem) => {
        dndItem.setAttribute("draggable", "true");
        dndItem.addEventListener("dragstart", (e: DragEvent) =>
          this.dragStartHandler(e, dndItem)
        );
        dndItem.addEventListener("dragover", (e: DragEvent) =>
          this.dragOverHandler(e)
        );
        dndItem.addEventListener("dragend", (e: DragEvent) =>
          this.dragEndHandler(e, dndItem)
        );
      });
    }
  }

  dragStartHandler(e: DragEvent, item: HTMLElement) {
    this.draggingItem = item;
    item.classList.add(this.draggingClass);
    this.onDragStart(e);
  }

  dragOverHandler(e: DragEvent) {
    e.preventDefault();
    this.dragAndDropItems = Array.from(
      this.dragAndDropListSelector.children
    ) as HTMLElement[];
    const notDraggingItems = this.dragAndDropItems.filter(
      (item) => item !== this.draggingItem
    ) as HTMLElement[];
    const nextItem = notDraggingItems.find((item) => {
      const notDraggingItemRect = item.getBoundingClientRect();
      return (
        e.clientY <= notDraggingItemRect.top + notDraggingItemRect.height / 2
      );
    }) as Node;
    this.draggingItem?.parentNode?.insertBefore(this.draggingItem, nextItem);
    this.onDragOver(e);
  }

  dragEndHandler(e: DragEvent, item: HTMLElement) {
    item.classList.remove(this.draggingClass);
    this.draggingItem = null;
    this.onDragEnd(e);
  }
}

declare global {
  interface HTMLElement {
    dragAndDrop(settings?: {
      draggingClass?: string;
      onDragStart?: (e?: DragEvent) => void;
      onDragOver?: (e?: DragEvent) => void;
      onDragEnd?: (e?: DragEvent) => void;
    }): void;
  }
}

HTMLElement.prototype.dragAndDrop = function (settings) {
  const settingsToSet = {
    draggingClass: settings?.draggingClass
      ? settings.draggingClass
      : defaultDraggingClass,
    onDragStart: settings?.onDragStart ? settings.onDragStart : () => {},
    onDragOver: settings?.onDragOver ? settings.onDragOver : () => {},
    onDragEnd: settings?.onDragEnd ? settings.onDragEnd : () => {},
  };
  const dragAndDrop = new DragAndDrop(
    this,
    settingsToSet.draggingClass,
    settingsToSet.onDragStart,
    settingsToSet.onDragOver,
    settingsToSet.onDragEnd
  );
  dragAndDrop.init();
};

export {};

// Add to HTML file and remove here

(document.querySelector(".drag-and-drop-zone-one") as HTMLElement).dragAndDrop({
  onDragStart: () => console.log("Drag start"),
  onDragEnd: () => console.log("Drag end"),
});

(document.querySelector(".drag-and-drop-zone-two") as HTMLElement).dragAndDrop({
  draggingClass: "second-dragging-item",
});
