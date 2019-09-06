import { Component, ViewChild, ElementRef, Input, AfterViewInit, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { TextPart, TextParts } from '../models/text-parts';
import { CursorPosition } from '../models/cursor-position';
import { ClipboardService } from '../clipboard.service';

const NODE_ID_ATTRIBUTE = 'data-part-id';

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

  @Input()
  dir: string;

  // The virtual cursor position might differ from the position in the DOM
  // this is because in the DOM empty elements cannot be selected.
  cursorPosition: CursorPosition = {
    startIndex: 0,
    startOffset: 0,
    endIndex: 0,
    endOffset: 0
  };

  parts: TextParts = new TextParts();

  composingKey = false;

  constructor(private clipboardService: ClipboardService) {
  }

  ngAfterViewInit() {
    this.partSpans.changes.subscribe((t: any) => {
      this.renderText(t.toArray());
    });
  }

  private renderText(spansRefs: ElementRef<HTMLSpanElement>[]) {
    const spans = spansRefs.map(s => s.nativeElement);

    for (const part of this.parts.items()) {
      spans[part.index].innerText = part.text;
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
      return this.parts.byId(id).index;
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
    if (this.parts.text.length === 0) {
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
    [startIndex, startOffset] = this.parts.skipEmpty(startIndex, startOffset);
    [endIndex, endOffset] = this.parts.skipEmpty(endIndex, endOffset);

    const contentElement = this.transcription.nativeElement;
    const selection = document.getSelection();
    const range = document.createRange();

    const nodeByIndex = (index: number) => spans
      ? spans[index]
      : contentElement.querySelector(`span[${NODE_ID_ATTRIBUTE}="${this.parts.byIndex(index).id}"]`);

    // select the text node, there should only be one under each span
    const anchorNode = nodeByIndex(startIndex).childNodes[0];
    const focusNode = nodeByIndex(endIndex).childNodes[0];

    contentElement.focus();

    range.setStart(anchorNode, startOffset);
    range.setEnd(focusNode, endOffset);

    selection.removeAllRanges();
    selection.addRange(range);
  }


  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const parts: TextPart[] = this.clipboardService.getParts(event.clipboardData);

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
      this.parts.replaceText(index, this.partSpans.toArray()[index].nativeElement.innerText);
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
        position.endOffset = this.parts.byIndex(position.endIndex).text.length;

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
    let hypo: boolean;

    if (this.parts.length) {
      if (position.startIndex === position.endIndex) {
        position = this.normalizePosition(position);

        // most common scenario when a user is typing and
        // adds a single character to an existing part
        const [part, textOffset] = this.parts.replaceText(
          position.startIndex,
          char,
          position.startOffset,
          position.endOffset);

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
      hypo = this.parts.byIndex(position.startIndex).hypo;
    }

    this.replaceParts([{
      text: char,
      hypo: hypo || false
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
          position.startOffset = this.parts.byIndex(position.startIndex).text.length - 1;
        } while (position.startOffset < 0 && position.startIndex > 0);
        // also delete empty preceding parts

      } else if (position.startOffset > 0) {
        // within a part, delete a single character
        position.startOffset--;
      }
    } else {
      const currPartEnd = this.parts.byIndex(position.endIndex).text.length - 1;
      if (position.endOffset > currPartEnd && position.endIndex < this.parts.length - 1) {
        // at end of current part
        do {
          position.endIndex++;
          position.endOffset = 1;
        } while (position.endIndex < this.parts.length - 1 && this.parts.byIndex(position.endIndex).text.length > 0);
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

    const { startIndex, endIndex, endOffset } = this.parts.replaceParts(newParts, position);

    this.cursorPosition = {
      startIndex: selectInsertion ? startIndex : endIndex,
      startOffset: selectInsertion ? 0 : endOffset,
      endIndex,
      endOffset
    };
  }

  updateSelection() {
    this.cursorPosition = this.getCursorPosition();
  }

  toggleComment() {
    this.transcription.nativeElement.focus();
    let position = this.cursorPosition;

    // TODO: retain backwards selection
    position = this.normalizePosition(position);

    const { startIndex, endIndex, endOffset } = this.parts.toggleHypo(position);

    this.cursorPosition = {
      startIndex,
      startOffset: 0,
      endIndex,
      endOffset
    };
  }
}
