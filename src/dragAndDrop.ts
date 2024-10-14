const defaultDraggingClass = "dragging-item";

let overActiveDragAndDropBox: HTMLElement | null;
let draggingItem: HTMLElement | null;

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
  private draggingClass: string;
  private isRemoveItemLogic: boolean;
  private onDragStart: (e?: DragEvent) => void;
  private onDragOver: (e?: DragEvent) => void;
  private onDragEnd: (e?: DragEvent) => void;

  constructor(
    dragAndDropListSelector: HTMLElement,
    draggingClass: string,
    removeItem: boolean,
    onDragStart: (e?: DragEvent) => void,
    onDragOver: (e?: DragEvent) => void,
    onDragEnd: (e?: DragEvent) => void
  ) {
    this.dragAndDropListSelector = dragAndDropListSelector;
    this.isInit = false;
    this.dragAndDropItems = Array.from(
      this.dragAndDropListSelector.children
    ) as HTMLElement[];
    this.draggingClass = draggingClass;
    this.isRemoveItemLogic = removeItem;
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
      this.dragAndDropListSelector.addEventListener(
        "dragenter",
        (e: DragEvent) => {
          if (e.currentTarget) {
            overActiveDragAndDropBox = <HTMLElement>e.currentTarget;
          }
        }
      );
    }
  }

  dragStartHandler(e: DragEvent, item: HTMLElement) {
    draggingItem = item;
    item.classList.add(this.draggingClass);
    overActiveDragAndDropBox = this.dragAndDropListSelector;
    this.onDragStart(e);
  }

  dragOverHandler(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
    let activeDndSelector = this.dragAndDropListSelector;
    if (overActiveDragAndDropBox) {
      activeDndSelector = overActiveDragAndDropBox;
    }
    const dndItems = Array.from(activeDndSelector.children) as HTMLElement[];
    const notDraggingItems = dndItems.filter(
      (item) => item !== draggingItem
    ) as HTMLElement[];
    const nextItem = notDraggingItems.find((item) => {
      const notDraggingItemRect = item.getBoundingClientRect();
      return (
        e.clientY <= notDraggingItemRect.top + notDraggingItemRect.height / 2
      );
    }) as Node;
    if (activeDndSelector && draggingItem) {
      activeDndSelector.insertBefore(draggingItem, nextItem);
    }
    this.onDragOver(e);
  }

  dragEndHandler(e: DragEvent, item: HTMLElement) {
    if (this.isRemoveItemLogic) {
      const dragAndDropListRect =
        this.dragAndDropListSelector.getBoundingClientRect();
      if (
        e.clientY < dragAndDropListRect.top ||
        e.clientY > dragAndDropListRect.top + dragAndDropListRect.height ||
        e.clientX < dragAndDropListRect.left ||
        e.clientX > dragAndDropListRect.left + dragAndDropListRect.width
      ) {
        item.parentNode?.removeChild(item);
      }
    }
    item.classList.remove(this.draggingClass);
    draggingItem = null;
    this.onDragEnd(e);
  }
}

declare global {
  interface HTMLElement {
    dragAndDrop(settings?: {
      draggingClass?: string;
      removeItem?: boolean;
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
    removeItem: settings?.removeItem ? settings.removeItem : false,
    onDragStart: settings?.onDragStart ? settings.onDragStart : () => {},
    onDragOver: settings?.onDragOver ? settings.onDragOver : () => {},
    onDragEnd: settings?.onDragEnd ? settings.onDragEnd : () => {},
  };
  const dragAndDrop = new DragAndDrop(
    this,
    settingsToSet.draggingClass,
    settingsToSet.removeItem,
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
  removeItem: true,
});
