import { Component, ViewChild, ElementRef, Input, AfterViewInit, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';

const HYPO_TEXT_CLASS_NAME = 'is-hypotext';
const NODE_ID_ATTRIBUTE = 'data-part-id';

interface CursorPosition {
  // index of the text part where the selection starts
  startIndex: number;
  startOffset: number;
  endIndex: number;
  endOffset: number;
}

interface TextPart {
  text: string;
  class: string;
  id: number;
}

@Component({
  selector: 'kht-hypo-editor',
  templateUrl: './hypo-editor.component.html',
  styleUrls: ['./hypo-editor.component.scss']
})
export class HypoEditorComponent implements AfterViewInit {

  @ViewChild('transcription', { static: true })
  transcription: ElementRef<HTMLParagraphElement>;

  @ViewChildren('partSpan')
  partSpans: QueryList<ElementRef<HTMLSpanElement>>;

  @Input()
  tabindex: number;

  // The virtual cursor position might differ from the position in the DOM
  // this is because in the DOM empty elements cannot be selected.
  cursorPosition: CursorPosition = {
    startIndex: 0,
    startOffset: 0,
    endIndex: 0,
    endOffset: 0
  };

  text: string;
  parts: TextPart[] = [];

  // counter to be able to give each part a unique ID
  partIds = 0;

  composingKey = false;

  constructor() {
  }

  ngAfterViewInit() {
    this.partSpans.changes.subscribe((t: any) => {
      this.renderText(t.toArray());
    });
  }

  private renderText(spansRefs: ElementRef<HTMLSpanElement>[]) {
    const spans = spansRefs.map(s => s.nativeElement);

    for (let i = 0; i < this.parts.length; i++) {
      spans[i].innerText = this.parts[i].text;
    }
    this.setCursorPosition(
      this.cursorPosition,
      spans);
  }

  private getCursorPosition(): CursorPosition {
    const selection = document.getSelection();
    const contentElement = this.transcription.nativeElement;

    const somethingElseSelected = !contentElement.contains(selection.anchorNode);
    if (somethingElseSelected || selection.anchorNode.isSameNode(contentElement)) {
      // then the cursor should be set at the end of the text
      return {
        startIndex: 0,
        startOffset: 0,
        endIndex: 0,
        endOffset: 0
      };
    }

    const getPartIndex = (node: Node) => {
      for (; node.nodeType !== Node.ELEMENT_NODE || !((node as Element).getAttribute(NODE_ID_ATTRIBUTE));
        node = node.parentNode) {
      }

      const id = parseInt((node as Element).getAttribute(NODE_ID_ATTRIBUTE), 10);
      return this.parts.findIndex(p => p.id === id);
    };

    const startIndex = getPartIndex(selection.anchorNode);
    const startOffset = selection.anchorOffset;

    let endIndex: number;
    let endOffset: number;

    if (selection.isCollapsed) {
      endIndex = startIndex;
      endOffset = startOffset;
    } else {
      endIndex = getPartIndex(selection.focusNode);
      endOffset = selection.focusOffset;
    }

    return {
      startIndex,
      startOffset,
      endIndex,
      endOffset
    };
  }

  private setCursorPosition(cursorPosition: CursorPosition, spans?: HTMLSpanElement[]) {
    if (this.parts.reduce((prev, curr) => prev + curr.text.length, 0) === 0) {
      // no text nodes to select
      return;
    }

    // make a copy of the variables to prevent updating the position property
    let startIndex = cursorPosition.startIndex;
    let startOffset = cursorPosition.startOffset;
    let endIndex = cursorPosition.endIndex;
    let endOffset = cursorPosition.endOffset;

    // empty nodes cannot be selected (they don't have text nodes)
    // move the DOM selection to the nearest node
    const skipEmpty = (index: number, offset: number) => {
      while (index > 0 && this.parts[index].text.length === 0) {
        index--;
        offset = this.parts[index].text.length;
      }

      while (index < this.parts.length && this.parts[index].text.length === 0) {
        index++;
        offset = 0;
      }

      return [index, offset];
    };

    [startIndex, startOffset] = skipEmpty(startIndex, startOffset);
    [endIndex, endOffset] = skipEmpty(endIndex, endOffset);

    const contentElement = this.transcription.nativeElement;
    const selection = document.getSelection();
    const range = document.createRange();

    const nodeByIndex = (index: number) => spans
      ? spans[index]
      : contentElement.querySelector(`span[${NODE_ID_ATTRIBUTE}="${this.parts[index].id}"]`);

    // select the text node, there should only be one under each span
    const anchorNode = nodeByIndex(startIndex).childNodes[0];
    const focusNode = nodeByIndex(endIndex).childNodes[0];

    contentElement.focus();

    range.setStart(anchorNode, startOffset);
    range.setEnd(focusNode, endOffset);

    selection.removeAllRanges();
    selection.addRange(range);
  }

  private * partsFromHtml(element: HTMLElement, parentClass?: string): IterableIterator<TextPart> {
    switch (element.tagName) {
      case 'HEAD':
      case 'STYLE':
      case 'SCRIPT':
        // don't include the text of these elements
        return;
    }

    parentClass = this.htmlElementIsHypo(element) ? HYPO_TEXT_CLASS_NAME : parentClass;
    if (element.childElementCount === 0) {
      yield {
        class: parentClass || '',
        text: element.textContent,
        id: this.partIds++
      };
      return;
    }

    for (const node of Array.from(element.childNodes)) {
      switch (node.nodeType) {
        case Node.TEXT_NODE:
        case Node.ENTITY_NODE:
        case Node.ENTITY_REFERENCE_NODE:
          yield {
            class: parentClass || '',
            text: node.textContent,
            id: this.partIds++
          };
          break;

        case Node.ELEMENT_NODE:
          yield* this.partsFromHtml(node as HTMLElement, parentClass);
          break;

        default:
          console.error(`Unsupported node type ${node.nodeType}`);
      }
    }
  }

  private htmlElementIsHypo(element: HTMLElement) {
    if (element.className === HYPO_TEXT_CLASS_NAME) {
      return true;
    }

    switch (element.tagName.toUpperCase()) {
      case 'B':
      case 'STRONG':
      case 'U':
      case 'I':
        return true;
    }

    return false;
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const parts: TextPart[] = [];

    if (event.clipboardData.types.indexOf('text/html') >= 0) {
      const data = event.clipboardData.getData('text/html');

      let placeholder: HTMLElement = document.createElement('div');
      placeholder.innerHTML = data;
      const body = placeholder.getElementsByTagName('body');
      if (body.length) {
        // only use the body
        placeholder = body[0];
      }

      // reconstruct the text and parts from the actual html
      let lastPart: TextPart;
      let atStart = true;

      for (const part of this.partsFromHtml(placeholder)) {
        // remove line breaks and tabs
        part.text = part.text.replace(/(\t|\n\r?)/g, ' ');

        if (atStart) {
          if (/^\s*$/.test(part.text)) {
            // skip empty parts at the start
            continue;
          }

          part.text = part.text.trimLeft();
          atStart = false;
        }

        if (lastPart && lastPart.class === part.class) {
          lastPart.text += part.text;
        } else {
          parts.push(part);
          lastPart = part;
        }
      }

      for (let i = parts.length - 1; i >= 0; i--) {
        if (/^\s*$/.test(parts[i].text)) {
          // remove empty parts at the end
          delete parts[i];
        } else {
          // trim the final part
          parts[i].text = parts[i].text.trimRight();
          break;
        }
      }
    } else {
      const text = event.clipboardData.getData('text/plain');
      parts.push({
        text: text.replace(/(\t|\n\r?)/g, ' ').trim(),
        class: '',
        id: this.partIds = 0
      });
    }

    this.replaceParts(parts.filter(p => !!p));
    return false;
  }

  keydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      // toggle hypotext
      if (['h', 'b', 'u', 'i'].indexOf(event.key) !== -1) {
        event.preventDefault();
        this.toggleComment();
        return false;
      }
    }

    let nativeAction = false;
    if (event.ctrlKey || event.metaKey || event.altKey) {
      nativeAction = true;
    }

    const keycode = event.which || event.keyCode;
    switch (keycode) {
      case 8: // BACKSPACE
        event.preventDefault();
        this.delete(true);
        return false;

      case 46: // DELETE
        event.preventDefault();
        this.delete(false);
        return false;

      case 27: // ESC
      case 112: // F1
      case 113: // F2
      case 114: // F3
      case 115: // F4
      case 116: // F5
      case 117: // F6
      case 118: // F7
      case 119: // F8
      case 120: // F9
      case 121: // F10
      case 122: // F11
      case 123: // F12
      case 145: // Scroll Lock
      case 19: // Pause
      case 9: // Tab
      case 20: // Caps
      case 16: // Shift
        nativeAction = true;
        break;

      case 229: // Composing (dead keys)
        this.composingKey = true;
        nativeAction = true;
        break;

      case 35: // End
      case 36: // Home
        this.homeEndPosition(keycode === 36, event.shiftKey);
        return false;
      case 37: // Left arrow
      case 38: // Up arrow
      case 39: // Right arrow
      case 40: // Down arrow
        nativeAction = true;
        break;

      case 13: // ENTER
        event.preventDefault();
        return false;
    }

    if (nativeAction) {
      // native action might affect the cursor position, read it
      setTimeout(() => {
        this.cursorPosition = this.getCursorPosition();
      }, 1);
      return true;
    }

    this.insertCharacter(event.key);
    return false;
  }

  keyup() {
    if (this.composingKey) {
      // a composed text (dead key) has been added, read this from
      // the dom and place the content back in the model
      this.composingKey = false;
      const index = this.cursorPosition.startIndex;
      this.parts[index].text = this.partSpans.toArray()[index].nativeElement.innerText;
      this.composingKey = false;
    }
  }

  private positionReversed(position: CursorPosition) {
    return position.startIndex > position.endIndex ||
      (position.startIndex === position.endIndex &&
        position.startOffset > position.endOffset);
  }

  private normalizePosition(position: CursorPosition, alwaysCopy = false) {
    if (this.positionReversed(position)) {
      // start and end could be flipped
      return {
        startIndex: position.endIndex,
        startOffset: position.endOffset,
        endIndex: position.startIndex,
        endOffset: position.startOffset
      };
    } else if (alwaysCopy) {
      return { ...position };
    }

    return position;
  }

  private homeEndPosition(home: boolean, select: boolean) {
    if (this.parts.length) {
      const position = this.normalizePosition(this.cursorPosition, true);

      if (home) {
        position.startIndex = 0;
        position.startOffset = 0;

        if (!select) {
          position.endIndex = 0;
          position.endOffset = 0;
        }
      } else {
        position.endIndex = this.parts.length - 1;
        position.endOffset = this.parts[position.endIndex].text.length;

        if (!select) {
          position.startIndex = position.endIndex;
          position.startOffset = position.endOffset;
        }
      }

      this.cursorPosition = position;
      if (this.partSpans.toArray().length === this.parts.length) {
        this.setCursorPosition(this.cursorPosition);
      }
    }
  }

  private insertCharacter(char: string, position: CursorPosition = this.cursorPosition) {
    let className: string;

    if (this.parts.length) {
      if (position.startIndex === position.endIndex) {
        position = this.normalizePosition(position);

        // most common scenario when a user is typing and
        // adds a single character to an existing part
        const part = this.parts[position.startIndex];
        part.text = `${part.text.substring(0, position.startOffset)}${
          char}${part.text.substring(position.endOffset)}`;
        const textOffset = position.startOffset + char.length;

        // Manually update the span contents: I could not find an event
        // triggered by having the text rendered in an existing DOM
        // element. So update the span directly and update the selection
        // afterwards.
        const spans = this.partSpans.toArray().map(e => e.nativeElement);
        spans[position.startIndex].innerText = part.text;

        this.setCursorPosition(
          this.cursorPosition = {
            startIndex: position.startIndex,
            startOffset: textOffset,
            endIndex: position.endIndex,
            endOffset: textOffset
          }, spans);
        return;
      }
      className = this.parts[position.startIndex].class;
    }

    this.replaceParts([{
      text: char,
      class: className || '',
      id: this.partIds++
    }],
      position);
  }

  private delete(backspace: boolean) {
    if (this.parts.length === 0) {
      return;
    }

    let position = this.cursorPosition;
    if (position.startIndex !== position.endIndex ||
      position.startOffset !== position.endOffset) {
      // selection range, delete it
      this.replaceParts([], position);
      return;
    }

    // backspace or delete from cursor
    position = this.normalizePosition(position, true);

    if (backspace) {
      if (position.startOffset === 0 && position.startIndex > 0) {
        // at beginning of current part
        do {
          position.startIndex--;
          position.startOffset = this.parts[position.startIndex].text.length - 1;
        } while (position.startOffset < 0 && position.startIndex > 0);
        // also delete empty preceding parts

      } else if (position.startOffset > 0) {
        // within a part, delete a single character
        position.startOffset--;
      }
    } else {
      const currPartEnd = this.parts[position.endIndex].text.length - 1;
      if (position.endOffset > currPartEnd && position.endIndex < this.parts.length - 1) {
        // at end of current part
        do {
          position.endIndex++;
          position.endOffset = 1;
        } while (position.endIndex < this.parts.length - 1 && this.parts[position.endIndex].text.length > 0);
        // also delete empty following parts

      } else if (position.endOffset <= currPartEnd) {
        // within a part, delete a single character
        position.endOffset++;
      }
    }

    if (position.startIndex === position.endIndex &&
      position.startOffset === position.endOffset) {
      // don't delete anything
      return;
    }

    const currLength = this.parts.length;
    this.replaceParts([], position);

    if (this.parts.length === currLength) {
      const spans = this.partSpans.toArray();
      if (spans.length === currLength) {
        // already rendered all the spans, but text has changed:
        // re-render the text
        this.renderText(spans);
      }
    }
  }

  private replaceParts(newParts: TextPart[], position: CursorPosition = this.cursorPosition, selectInsertion = false) {
    position = this.normalizePosition(position);
    const updatedParts: TextPart[] = [];

    for (let i = 0; i < position.startIndex; i++) {
      // copy everything before the selection bounds
      updatedParts.push(this.parts[i]);
    }

    if (this.parts.length) {
      const startPart = this.parts[position.startIndex];
      const startText = startPart.text.substring(0, position.startOffset);
      if (startText.length) {
        updatedParts.push({
          class: startPart.class,
          id: startPart.id,
          text: startText
        });
      }
    }

    const startIndex = updatedParts.length;

    let newIndex = updatedParts.length - 1;
    let newOffset = updatedParts.length ? updatedParts[newIndex].text.length : 0;

    for (const newPart of newParts) {
      updatedParts.push(newPart);
      newIndex++;
      newOffset = newPart.text.length;
    }

    if (this.parts.length > 0) {
      const endPart = this.parts[position.endIndex];
      const endText = endPart.text.substring(position.endOffset);

      if (endText.length) {
        if (position.endIndex === position.startIndex && position.startOffset > 0) {
          // split in two parts, two different ids needed
          updatedParts.push({
            id: this.partIds++,
            class: endPart.class,
            text: endText
          });
        } else {
          endPart.text = endText;
          updatedParts.push(endPart);
        }
      }
    }

    for (let i = position.endIndex + 1; i < this.parts.length; i++) {
      // copy everything after the selection bounds
      updatedParts.push(this.parts[i]);
    }

    if (newIndex < 0) {
      // no negative index
      newIndex = 0;
    }

    this.parts = updatedParts;
    this.cursorPosition = {
      startIndex: selectInsertion ? startIndex : newIndex,
      startOffset: selectInsertion ? 0 : newOffset,
      endIndex: newIndex,
      endOffset: newOffset
    };
  }

  updateSelection() {
    this.cursorPosition = this.getCursorPosition();
  }

  toggleComment() {
    this.transcription.nativeElement.focus();
    let position = this.cursorPosition;
    position = this.normalizePosition(position);

    if (this.parts.length === 0) {
      this.parts.push({
        id: this.partIds = 0,
        class: HYPO_TEXT_CLASS_NAME,
        text: ''
      });
      return;
    }

    const currentPart = this.parts[position.startIndex];
    if (position.startIndex === position.endIndex &&
      position.startOffset === 0 &&
      currentPart.text.length === position.endOffset - 1) {
      // toggle the hypo class of the entire part
      currentPart.class = currentPart.class.indexOf(HYPO_TEXT_CLASS_NAME) === -1
        ? HYPO_TEXT_CLASS_NAME
        : '';

      return;
    }

    let text = '';
    let toNormal = true;

    for (let i = position.startIndex; i <= position.endIndex; i++) {
      const part = this.parts[i];
      if (part.class.indexOf(HYPO_TEXT_CLASS_NAME) === -1) {
        toNormal = false;
      }

      if (i === position.startIndex) {
        text += part.text.substring(position.startOffset, i === position.endIndex ? position.endOffset : undefined);
      } else if (i === position.endIndex) {
        text += part.text.substring(0, position.endOffset);
      } else {
        text += part.text;
      }
    }

    this.replaceParts([{
      class: toNormal ? '' : HYPO_TEXT_CLASS_NAME,
      id: this.partIds++,
      text
    }],
      position,
      true);
  }
}
