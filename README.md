# DragAndDrop

DragAndDrop is a minimalist JavaScript library that enables intuitive drag-and-drop functionality for rearranging elements on a webpage. Integrate it into your project effortlessly to enhance interactivity and user experience.

## Installation

To install DragAndDrop, follow these steps:

1. Go to the releases section in this repository.
2. Download the latest release of DragAndDrop.
3. Unzip the downloaded archive.
4. Include the **drag-and-drop.min.js** file in your project.

## Usage

After adding the library to your project, initialize it on any HTML element containing items to be dragged and dropped. Customize its behavior with optional settings:

| Setting                 | Type                 | Description                                                                                          |
| ----------------------- | -------------------- | ---------------------------------------------------------------------------------------------------- |
| `draggingClass`         | `string`             | The class applied to an item when it is being dragged (default: `"dragging-item"`).                  |
| `removeItem`            | `boolean`            | Specifies if an item should be removed if dropped outside the drag-and-drop list (default: `false`). |
| `allowDnDFromSelectors` | `string \| string[]` | A CSS selector or an array of selectors defining elements from which dragging is allowed.            |
| `onDragStart`           | `Function`           | A callback function triggered when dragging starts.                                                  |
| `onDragOver`            | `Function`           | A callback function triggered when an item is dragged over another item in the list.                 |
| `onDragEnd`             | `Function`           | A callback function triggered when dragging ends.                                                    |

### Example Usage

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DragAndDrop Example</title>
    <script src="drag-and-drop.min.js"></script>
  </head>
  <body>
    <ul id="myDragAndDropList">
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
    <script>
      document.getElementById("myDragAndDropList").dragAndDrop({
        removeItem: true,
        allowDnDFromSelectors: ".other-list",
        onDragStart: () => console.log("Drag started"),
        onDragOver: () => console.log("Dragged over"),
        onDragEnd: () => console.log("Drag ended"),
      });
    </script>
  </body>
</html>
```

## Notes

- Simply call `.dragAndDrop()` on any HTML element containing items to enable drag-and-drop functionality.
- If `draggingClass` is omitted, the default class `"dragging-item"` will be applied to the dragged item.
- You can pass either a single CSS selector string or an array of selectors to `allowDnDFromSelectors`. If a single selector is used, you do not need to wrap it in an array.
- You can initialize multiple elements independently, allowing for separate drag-and-drop zones within a single page.
