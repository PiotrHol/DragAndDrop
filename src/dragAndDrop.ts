const defaultDraggingClass = "dragging-item";

let overActiveDragAndDropBox: HTMLElement | null;
let draggingItem: HTMLElement | null;
let initialStartDnDList: HTMLElement | null;
let onDragStartMap = new Map();
let onDragOverMap = new Map();
let onDragEndMap = new Map();

interface DnD {
  init: () => void;
  dragStartHandler: (e: DragEvent, element: HTMLElement) => void;
  dragOverHandler: (e: DragEvent) => void;
  dragEndHandler: (e: DragEvent, element: HTMLElement) => void;
}

class DragAndDrop implements DnD {
  private dragAndDropList: HTMLElement;
  private isInit: boolean;
  private dragAndDropItems: HTMLElement[];
  private draggingClass: string;
  private isRemoveItemLogic: boolean;
  private allowDnDFromSelectors: string[];

  constructor(
    dragAndDropList: HTMLElement,
    draggingClass: string,
    removeItem: boolean,
    allowDnDFromSelectors: string[],
    onDragStart: (e?: DragEvent) => void,
    onDragOver: (e?: DragEvent) => void,
    onDragEnd: (e?: DragEvent) => void
  ) {
    this.dragAndDropList = dragAndDropList;
    this.isInit = false;
    this.dragAndDropItems = Array.from(
      this.dragAndDropList.children
    ) as HTMLElement[];
    this.draggingClass = draggingClass;
    this.allowDnDFromSelectors = allowDnDFromSelectors;
    this.isRemoveItemLogic = removeItem;
    onDragStartMap.set(dragAndDropList, onDragStart);
    onDragOverMap.set(dragAndDropList, onDragOver);
    onDragEndMap.set(dragAndDropList, onDragEnd);
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
      this.dragAndDropList.addEventListener("dragenter", (e: DragEvent) =>
        this.dragEnterHandler(e)
      );
    }
  }

  dragStartHandler(e: DragEvent, item: HTMLElement) {
    draggingItem = item;
    item.classList.add(this.draggingClass);
    if (this.dragAndDropList.contains(item)) {
      initialStartDnDList = this.dragAndDropList;
      overActiveDragAndDropBox = this.dragAndDropList;
    }
    if (onDragStartMap.get(item.parentElement)) {
      onDragStartMap.get(item.parentElement)();
    }
  }

  dragOverHandler(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
    let activeDndSelector = this.dragAndDropList;
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
    if (onDragOverMap.get(draggingItem?.parentElement)) {
      onDragOverMap.get(draggingItem?.parentElement)();
    }
  }

  dragEndHandler(e: DragEvent, item: HTMLElement) {
    if (
      this.isRemoveItemLogic &&
      overActiveDragAndDropBox === this.dragAndDropList
    ) {
      const dragAndDropListRect =
        overActiveDragAndDropBox.getBoundingClientRect();
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
    initialStartDnDList = null;
    if (onDragEndMap.get(item.parentElement)) {
      onDragEndMap.get(item.parentElement)();
    }
  }

  dragEnterHandler(e: DragEvent) {
    let allowAssignDnDBox = false;
    for (const allowDndElem of this.allowDnDFromSelectors) {
      if (overActiveDragAndDropBox?.classList.contains(allowDndElem)) {
        allowAssignDnDBox = true;
        break;
      }
    }
    let isInitDnDList = false;
    if (initialStartDnDList) {
      isInitDnDList = true;
      for (const initDnDListClass of Array.from(
        initialStartDnDList.classList
      )) {
        if (
          !(e.currentTarget as HTMLElement)?.classList.contains(
            initDnDListClass
          )
        ) {
          isInitDnDList = false;
          break;
        }
      }
    }
    if (allowAssignDnDBox || isInitDnDList) {
      overActiveDragAndDropBox = <HTMLElement>e.currentTarget;
    }
  }
}

declare global {
  interface HTMLElement {
    dragAndDrop(settings?: {
      draggingClass?: string;
      removeItem?: boolean;
      allowDnDFromSelectors?: string | string[];
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
    allowDnDFromSelectors: settings?.allowDnDFromSelectors
      ? Array.isArray(settings.allowDnDFromSelectors)
        ? [...settings.allowDnDFromSelectors]
        : [settings.allowDnDFromSelectors]
      : [],
    onDragStart: settings?.onDragStart ? settings.onDragStart : () => {},
    onDragOver: settings?.onDragOver ? settings.onDragOver : () => {},
    onDragEnd: settings?.onDragEnd ? settings.onDragEnd : () => {},
  };
  const dragAndDrop = new DragAndDrop(
    this,
    settingsToSet.draggingClass,
    settingsToSet.removeItem,
    settingsToSet.allowDnDFromSelectors,
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
