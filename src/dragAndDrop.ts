const defaultDraggingClass = "dragging-item";

abstract class BaseDragAndDrop {
  static overActiveDragAndDropBox: HTMLElement | null = null;
  static draggingItem: HTMLElement | null = null;
  static initialStartDnDList: HTMLElement | null = null;
  static lastTouchMoveElement: HTMLElement | null = null;
  static touchDnDPreview: HTMLElement | null = null;
  static draggingClassMap: Map<HTMLElement, string> = new Map();
  static onDragStartMap: Map<HTMLElement, Function> = new Map();
  static onDragOverMap: Map<HTMLElement, Function> = new Map();
  static onDragEndMap: Map<HTMLElement, Function> = new Map();
}

interface DnD {
  init: () => void;
  dragStartHandler: (element: HTMLElement) => void;
  dragOverHandler: (e: DragEvent | TouchEvent) => void;
  dragEndHandler: (e: DragEvent | TouchEvent, element: HTMLElement) => void;
  dragEnterHandler: (e: DragEvent | TouchEvent) => void;
  touchStartHandler: (e: TouchEvent, element: HTMLElement) => void;
  touchMoveHandler: (e: TouchEvent) => void;
  touchEndHandler: (e: TouchEvent, element: HTMLElement) => void;
}

class DragAndDrop extends BaseDragAndDrop implements DnD {
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
    super();
    this.dragAndDropList = dragAndDropList;
    this.isInit = false;
    this.dragAndDropItems = Array.from(
      this.dragAndDropList.children
    ) as HTMLElement[];
    this.allowDnDFromSelectors = allowDnDFromSelectors;
    this.isRemoveItemLogic = removeItem;
    DragAndDrop.draggingClassMap.set(dragAndDropList, draggingClass);
    DragAndDrop.onDragStartMap.set(dragAndDropList, onDragStart);
    DragAndDrop.onDragOverMap.set(dragAndDropList, onDragOver);
    DragAndDrop.onDragEndMap.set(dragAndDropList, onDragEnd);
  }

  init() {
    if (!this.isInit) {
      this.isInit = true;
      this.dragAndDropItems.forEach((dndItem) => {
        dndItem.setAttribute("draggable", "true");
        dndItem.addEventListener("dragstart", () =>
          this.dragStartHandler(dndItem)
        );
        dndItem.addEventListener("touchstart", (e: TouchEvent) => {
          this.touchStartHandler(e, dndItem);
        });
        dndItem.addEventListener("dragover", (e: DragEvent) =>
          this.dragOverHandler(e)
        );
        dndItem.addEventListener("touchmove", (e: TouchEvent) =>
          this.dragOverHandler(e)
        );
        dndItem.addEventListener("dragend", (e: DragEvent) =>
          this.dragEndHandler(e, dndItem)
        );
        dndItem.addEventListener("touchend", (e: TouchEvent) => {
          this.touchEndHandler(e, dndItem);
        });
      });
      this.dragAndDropList.addEventListener("dragenter", (e: DragEvent) =>
        this.dragEnterHandler(e)
      );
      this.dragAndDropList.addEventListener("dragover", (e: DragEvent) =>
        this.dragOverHandler(e)
      );
      this.dragAndDropList.addEventListener("touchmove", (e: TouchEvent) =>
        this.dragOverHandler(e)
      );
      document.addEventListener("touchmove", (e: TouchEvent) =>
        this.touchMoveHandler(e)
      );
    }
  }

  dragStartHandler(item: HTMLElement) {
    DragAndDrop.draggingItem = item;
    if (item.parentElement) {
      const draggingClass = DragAndDrop.draggingClassMap.get(
        item.parentElement
      );
      if (draggingClass) {
        item.classList.add(draggingClass);
      }
    }
    if (this.dragAndDropList.contains(item)) {
      DragAndDrop.initialStartDnDList = this.dragAndDropList;
      DragAndDrop.overActiveDragAndDropBox = this.dragAndDropList;
    }
    if (item.parentElement) {
      const onDragStartFunc = DragAndDrop.onDragStartMap.get(
        item.parentElement
      );
      if (onDragStartFunc) {
        onDragStartFunc();
      }
    }
  }

  touchStartHandler(e: TouchEvent, item: HTMLElement) {
    DragAndDrop.touchDnDPreview = item.cloneNode(true) as HTMLElement;
    if (DragAndDrop.touchDnDPreview.getAttribute("id")) {
      DragAndDrop.touchDnDPreview.setAttribute("id", "");
    }
    if (DragAndDrop.touchDnDPreview.getAttribute("name")) {
      DragAndDrop.touchDnDPreview.setAttribute("name", "");
    }
    DragAndDrop.touchDnDPreview.style.position = "fixed";
    DragAndDrop.touchDnDPreview.style.pointerEvents = "none";
    DragAndDrop.touchDnDPreview.style.zIndex = "10000";
    DragAndDrop.touchDnDPreview.style.transition = "none";
    DragAndDrop.touchDnDPreview.style.left = `${e.touches[0].clientX}px`;
    DragAndDrop.touchDnDPreview.style.top = `${e.touches[0].clientY}px`;
    document.body.appendChild(DragAndDrop.touchDnDPreview);
    this.dragStartHandler(item);
  }

  dragOverHandler(e: DragEvent | TouchEvent) {
    e.preventDefault();
    if (e instanceof DragEvent && e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
    let eventClientY: number;
    if (e instanceof TouchEvent) {
      eventClientY = e.changedTouches[0].clientY;
    } else {
      eventClientY = e.clientY;
    }
    let activeDndSelector = this.dragAndDropList;
    if (DragAndDrop.overActiveDragAndDropBox) {
      activeDndSelector = DragAndDrop.overActiveDragAndDropBox;
    }
    const dndItems = Array.from(activeDndSelector.children) as HTMLElement[];
    const notDraggingItems = dndItems.filter(
      (item) => item !== DragAndDrop.draggingItem
    ) as HTMLElement[];
    const nextItem = notDraggingItems.find((item) => {
      const notDraggingItemRect = item.getBoundingClientRect();
      return (
        eventClientY <= notDraggingItemRect.top + notDraggingItemRect.height / 2
      );
    }) as Node;
    if (
      activeDndSelector &&
      DragAndDrop.draggingItem &&
      !DragAndDrop.draggingItem.contains(activeDndSelector)
    ) {
      activeDndSelector.insertBefore(DragAndDrop.draggingItem, nextItem);
    }
    if (DragAndDrop.draggingItem && DragAndDrop.draggingItem.parentElement) {
      const onDragOverFunc = DragAndDrop.onDragOverMap.get(
        DragAndDrop.draggingItem.parentElement
      );
      if (onDragOverFunc) {
        onDragOverFunc();
      }
    }
  }

  touchMoveHandler(e: TouchEvent) {
    const eventClientX = e.touches[0].clientX;
    const eventClientY = e.touches[0].clientY;
    if (DragAndDrop.touchDnDPreview) {
      DragAndDrop.touchDnDPreview.style.left = `${eventClientX}px`;
      DragAndDrop.touchDnDPreview.style.top = `${eventClientY}px`;
    }
    const currentMoveElement = document.elementFromPoint(
      eventClientX,
      eventClientY
    ) as HTMLElement;
    if (
      currentMoveElement &&
      currentMoveElement === this.dragAndDropList &&
      DragAndDrop.lastTouchMoveElement !== currentMoveElement
    ) {
      this.dragEnterHandler(e);
      DragAndDrop.lastTouchMoveElement = currentMoveElement;
      return;
    }
    DragAndDrop.lastTouchMoveElement = null;
  }

  dragEndHandler(e: DragEvent | TouchEvent, item: HTMLElement) {
    if (
      this.isRemoveItemLogic &&
      DragAndDrop.overActiveDragAndDropBox === this.dragAndDropList
    ) {
      const dragAndDropListRect =
        DragAndDrop.overActiveDragAndDropBox.getBoundingClientRect();
      let eventClientX: number;
      let eventClientY: number;
      if (e instanceof TouchEvent) {
        eventClientX = e.changedTouches[0].clientX;
        eventClientY = e.changedTouches[0].clientY;
      } else {
        eventClientX = e.clientX;
        eventClientY = e.clientY;
      }
      if (
        eventClientY < dragAndDropListRect.top ||
        eventClientY > dragAndDropListRect.top + dragAndDropListRect.height ||
        eventClientX < dragAndDropListRect.left ||
        eventClientX > dragAndDropListRect.left + dragAndDropListRect.width
      ) {
        item.parentNode?.removeChild(item);
      }
    }
    if (item.parentElement) {
      const parentDraggingClass = DragAndDrop.draggingClassMap.get(
        item.parentElement
      );
      if (parentDraggingClass) {
        item.classList.remove(parentDraggingClass);
      }
    }
    const dndListDraggingClass = DragAndDrop.draggingClassMap.get(
      this.dragAndDropList
    );
    if (dndListDraggingClass) {
      item.classList.remove(dndListDraggingClass);
    }
    DragAndDrop.draggingItem = null;
    DragAndDrop.initialStartDnDList = null;
    if (item.parentElement) {
      const onDragEndFunc = DragAndDrop.onDragEndMap.get(item.parentElement);
      if (onDragEndFunc) {
        onDragEndFunc();
      }
    }
  }

  touchEndHandler(e: TouchEvent, item: HTMLElement) {
    if (DragAndDrop.touchDnDPreview) {
      DragAndDrop.touchDnDPreview.remove();
      DragAndDrop.touchDnDPreview = null;
    }
    this.dragEndHandler(e, item);
  }

  dragEnterHandler(e: DragEvent | TouchEvent) {
    let eventCurrentTarget: EventTarget | null;
    if (e instanceof TouchEvent) {
      eventCurrentTarget = document.elementFromPoint(
        e.touches[0].clientX,
        e.touches[0].clientY
      );
    } else {
      eventCurrentTarget = e.currentTarget;
    }
    let allowAssignDnDBox = false;
    for (const allowDndElem of this.allowDnDFromSelectors) {
      if (
        DragAndDrop.overActiveDragAndDropBox?.classList.contains(allowDndElem)
      ) {
        allowAssignDnDBox = true;
        break;
      }
    }
    let isInitDnDList = false;
    if (DragAndDrop.initialStartDnDList) {
      isInitDnDList = true;
      for (const initDnDListClass of Array.from(
        DragAndDrop.initialStartDnDList.classList
      )) {
        if (
          !(eventCurrentTarget as HTMLElement)?.classList.contains(
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
    if (DragAndDrop.overActiveDragAndDropBox) {
      const overActiveDnDBoxDraggingClass = DragAndDrop.draggingClassMap.get(
        DragAndDrop.overActiveDragAndDropBox
      );
      if (overActiveDnDBoxDraggingClass) {
        DragAndDrop.draggingItem?.classList.remove(
          overActiveDnDBoxDraggingClass
        );
      }
    }
    DragAndDrop.overActiveDragAndDropBox = <HTMLElement>eventCurrentTarget;
    if (DragAndDrop.overActiveDragAndDropBox) {
      const overActiveDnDBoxDraggingClass = DragAndDrop.draggingClassMap.get(
        DragAndDrop.overActiveDragAndDropBox
      );
      if (overActiveDnDBoxDraggingClass) {
        DragAndDrop.draggingItem?.classList.add(overActiveDnDBoxDraggingClass);
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
