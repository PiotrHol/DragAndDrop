const defaultDraggingClass = "dragging-item";

let overActiveDragAndDropBox: HTMLElement | null;
let draggingItem: HTMLElement | null;
let initialStartDnDList: HTMLElement | null;
let draggingClassMap: Map<HTMLElement, string> = new Map();
let onDragStartMap: Map<HTMLElement, Function> = new Map();
let onDragOverMap: Map<HTMLElement, Function> = new Map();
let onDragEndMap: Map<HTMLElement, Function> = new Map();

interface DnD {
  init: () => void;
  dragStartHandler: (element: HTMLElement) => void;
  dragOverHandler: (e: DragEvent) => void;
  dragEndHandler: (e: DragEvent, element: HTMLElement) => void;
}

class DragAndDrop implements DnD {
  private dragAndDropList: HTMLElement;
  private isInit: boolean;
  private dragAndDropItems: HTMLElement[];
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
    this.allowDnDFromSelectors = allowDnDFromSelectors;
    this.isRemoveItemLogic = removeItem;
    draggingClassMap.set(dragAndDropList, draggingClass);
    onDragStartMap.set(dragAndDropList, onDragStart);
    onDragOverMap.set(dragAndDropList, onDragOver);
    onDragEndMap.set(dragAndDropList, onDragEnd);
  }

  init() {
    if (!this.isInit) {
      this.isInit = true;
      this.dragAndDropItems.forEach((dndItem) => {
        dndItem.setAttribute("draggable", "true");
        dndItem.addEventListener("dragstart", () =>
          this.dragStartHandler(dndItem)
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
      this.dragAndDropList.addEventListener("dragover", (e: DragEvent) =>
        this.dragOverHandler(e)
      );
    }
  }

  dragStartHandler(item: HTMLElement) {
    draggingItem = item;
    if (item.parentElement) {
      const draggingClass = draggingClassMap.get(item.parentElement);
      if (draggingClass) {
        item.classList.add(draggingClass);
      }
    }
    if (this.dragAndDropList.contains(item)) {
      initialStartDnDList = this.dragAndDropList;
      overActiveDragAndDropBox = this.dragAndDropList;
    }
    if (item.parentElement) {
      const onDragStartFunc = onDragStartMap.get(item.parentElement);
      if (onDragStartFunc) {
        onDragStartFunc();
      }
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
    if (
      activeDndSelector &&
      draggingItem &&
      !draggingItem.contains(activeDndSelector)
    ) {
      activeDndSelector.insertBefore(draggingItem, nextItem);
    }
    if (draggingItem && draggingItem.parentElement) {
      const onDragOverFunc = onDragOverMap.get(draggingItem.parentElement);
      if (onDragOverFunc) {
        onDragOverFunc();
      }
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
    if (item.parentElement) {
      const parentDraggingClass = draggingClassMap.get(item.parentElement);
      if (parentDraggingClass) {
        item.classList.remove(parentDraggingClass);
      }
    }
    const dndListDraggingClass = draggingClassMap.get(this.dragAndDropList);
    if (dndListDraggingClass) {
      item.classList.remove(dndListDraggingClass);
    }
    draggingItem = null;
    initialStartDnDList = null;
    if (item.parentElement) {
      const onDragEndFunc = onDragEndMap.get(item.parentElement);
      if (onDragEndFunc) {
        onDragEndFunc();
      }
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
    if (!allowAssignDnDBox && !isInitDnDList) {
      return;
    }
    if (overActiveDragAndDropBox) {
      const overActiveDnDBoxDraggingClass = draggingClassMap.get(
        overActiveDragAndDropBox
      );
      if (overActiveDnDBoxDraggingClass) {
        draggingItem?.classList.remove(overActiveDnDBoxDraggingClass);
      }
    }
    overActiveDragAndDropBox = <HTMLElement>e.currentTarget;
    if (overActiveDragAndDropBox) {
      const overActiveDnDBoxDraggingClass = draggingClassMap.get(
        overActiveDragAndDropBox
      );
      if (overActiveDnDBoxDraggingClass) {
        draggingItem?.classList.add(overActiveDnDBoxDraggingClass);
      }
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

(
  document.querySelector(".drag-and-drop-zone-three") as HTMLElement
).dragAndDrop({
  draggingClass: "second-dragging-item",
  allowDnDFromSelectors: "drag-and-drop-zone-four",
});

(document.querySelector(".drag-and-drop-zone-four") as HTMLElement).dragAndDrop(
  {
    draggingClass: "second-dragging-item",
    allowDnDFromSelectors: "drag-and-drop-zone-three",
  }
);
