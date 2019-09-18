import {
  Component,
  ViewChild,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  AfterViewInit,
  QueryList,
  ViewChildren
} from '@angular/core';

import { CursorPosition, Direction } from '../models/cursor-position';
import { TextPart, TextPartCollection, TextPartSelection } from '../models/text-part-collection';

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

  @Output()
  hypoChange = new EventEmitter<boolean>();

  // is the current selection hypo?
  isHypo = false;

  // The virtual cursor position might differ from the position in the DOM
  // this is because in the DOM empty elements cannot be selected.
  cursorPosition = new CursorPosition();

  parts: TextPartCollection = new TextPartCollection();

  composingKey = false;

  constructor(private clipboardService: ClipboardService) {
  }

  ngAfterViewInit() {
    this.partSpans.changes.subscribe((t: any) => {
      this.renderText(t.toArray());
      this.checkHypoVal();
    });
  }

  private checkHypoVal() {
    const hypo = this.parts.isAllHypo(this.cursorPosition.forwards().forwards);
    if (hypo !== this.isHypo) {
      this.isHypo = hypo;
      this.hypoChange.next(hypo);
    }
  }

  private renderText(spansRefs: ElementRef<HTMLSpanElement>[]) {
    const spans = spansRefs.map(s => s.nativeElement);

    for (const part of this.parts.items()) {
      spans[part.index].innerText = part.text;
    }
    this.setCursorPosition(this.cursorPosition.get(), spans);
  }

  private getCursorPosition() {
    const selection = document.getSelection();
    const contentElement = this.transcription.nativeElement;

    const somethingElseSelected = !contentElement.contains(selection.anchorNode);
    if (somethingElseSelected || selection.anchorNode.isSameNode(contentElement)) {
      // then the cursor should be set at the start of the text
      return {
        startIndex: 0,
        startOffset: 0,
        endIndex: 0,
        endOffset: 0
      };
    }

    const startIndex = this.getPartIndex(selection.anchorNode);
    const startOffset = selection.anchorOffset;

    let endIndex: number;
    let endOffset: number;

    if (selection.isCollapsed) {
      endIndex = startIndex;
      endOffset = startOffset;
    } else {
      endIndex = this.getPartIndex(selection.focusNode);
      endOffset = selection.focusOffset;
    }

    return {
      startIndex,
      startOffset,
      endIndex,
      endOffset
    };
  }

  private getPartIndex(node: Node) {
    for (; node.nodeType !== Node.ELEMENT_NODE || !((node as Element).getAttribute(NODE_ID_ATTRIBUTE));
      node = node.parentNode) {
    }

    const id = parseInt((node as Element).getAttribute(NODE_ID_ATTRIBUTE), 10);
    return this.parts.byId(id).index;
  }

  /**
   * Empty nodes cannot be selected (they don't have text nodes)
   * move the DOM selection to the nearest node.
   */
  private skipEmptyNodes(cursorPosition: TextPartSelection) {
    const [startIndex, startOffset] = this.parts.skipEmpty(
      cursorPosition.startIndex,
      cursorPosition.startOffset);
    const [endIndex, endOffset] = this.parts.skipEmpty(
      cursorPosition.endIndex,
      cursorPosition.endOffset);

    return {
      startIndex,
      startOffset,
      endIndex,
      endOffset
    };
  }

  private setCursorPosition(cursorPosition: TextPartSelection, spans?: HTMLSpanElement[]) {
    if (this.parts.text.length === 0) {
      // no text nodes to select
      return;
    }

    // make a copy of the variables to prevent updating the position property
    const {
      startIndex,
      startOffset,
      endIndex,
      endOffset
    } = this.skipEmptyNodes(cursorPosition);

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

    if (cursorPosition.forward) {
      range.setStart(anchorNode, startOffset);
      range.setEnd(focusNode, endOffset);

      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // going backwards needs a slightly different call
      range.setStart(anchorNode, startOffset);

      selection.removeAllRanges();
      selection.addRange(range);
      selection.extend(focusNode, endOffset);
    }
  }

  onCut(event: ClipboardEvent) {
    this.onCopy(event, true);
  }

  onCopy(event: ClipboardEvent, cut = false) {
    const selection = this.cursorPosition.forwards().forwards;
    event.clipboardData.setData(
      'text/html',
      Array.from(this.parts.select(selection)).map(part => part.hypo ? `<strong>${part.text}</strong>` : part.text).join(''));
    event.clipboardData.setData(
      'text/plain',
      this.parts.substring(selection));
    event.preventDefault();

    if (cut) {
      this.replaceParts([], selection);
    }
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
      if (['h', 'b', 'u', 'i'].includes(event.key)) {
        event.preventDefault();
        this.toggleComment();
        return false;
      } else if (event.key === 'a') {
        // work-around for Firefox: when selecting everything for some
        // reason the cursor only ends up selecting a boundary
        this.move('home', false);
        this.move('end', true);
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

      case 9: // Tab
        // allow normal behavior, don't update the selection
        // it will get confused otherwise (because the cursor is no
        // longer in the text)
        return true;

      case 46: // DELETE
        event.preventDefault();
        this.delete(false);
        return false;

      case 17: // CTRL
      case 18: // ALT
      case 91: // OS
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
      case 20: // Caps
      case 16: // Shift
        nativeAction = true;
        break;

      case 229: // Composing (dead keys)
        this.composingKey = true;
        // retain the current selection, compose otherwise
        // gives a very weird position
        return true;

      case 35: // End
      case 36: // Home
        event.preventDefault();
        this.move(keycode === 36 ? 'home' : 'end', event.shiftKey);
        return false;
      case 37: // Left arrow
      case 39: // Right arrow
        event.preventDefault();
        if (event.ctrlKey || event.metaKey || event.altKey) {
          this.move(keycode === 39 ? 'nextWord' : 'prevWord', event.shiftKey);
        } else {
          this.move(keycode === 39 ? 'next' : 'prev', event.shiftKey);
        }
        return false;

      case 38: // Up arrow
      case 40: // Down arrow
        return false;

      case 13: // ENTER
        event.preventDefault();
        return false;
    }

    if (nativeAction) {
      // native action might affect the cursor position, read it
      setTimeout(() => {
        this.updateSelection();
      }, 1);
      return true;
    } else {
      event.preventDefault();
      this.insertCharacter(event.key);
    }
    return false;
  }

  keyup() {
    if (this.composingKey) {
      // a composed text (dead key) has been added, read this from
      // the DOM and place the content back in the model
      this.composingKey = false;
      const { forwards } = this.cursorPosition.forwards();

      // replace the current selection with the composed entry
      const textNode = this.parts.text.length
        ? this.partSpans.toArray()[forwards.startIndex].nativeElement
        : this.transcription.nativeElement;

      const {
        endIndex,
        endOffset
      } = this.parts.composed(
        textNode.innerText.substr(forwards.startOffset),
        forwards);

      if (textNode === this.transcription.nativeElement) {
        // if the text ended up in the field itself, remove it
        // it will be added to a text part which are rendered as spans
        textNode.removeChild(textNode.childNodes[0]);
      }

      this.cursorPosition.set({
        startIndex: endIndex,
        startOffset: endOffset,
        endIndex,
        endOffset
      });
    }
  }

  private move(direction: Direction, select: boolean) {
    if (this.parts.length) {
      const position = this.cursorPosition.move(this.parts, direction, select);

      if (this.partSpans.toArray().length === this.parts.length) {
        this.setCursorPosition(position);
        this.checkHypoVal();
      }
    }
  }

  private insertCharacter(char: string) {
    const { forwards } = this.cursorPosition.forwards();

    const hypo = this.parts.length > 0 &&
      this.parts.byIndex(forwards.startIndex).hypo;

    this.replaceParts([{
      text: char,
      hypo
    }], forwards);
  }

  private delete(backspace: boolean) {
    if (this.parts.length === 0) {
      return;
    }
    let selection = this.cursorPosition.get();
    if (selection.startIndex !== selection.endIndex ||
      selection.startOffset !== selection.endOffset) {
      // selection range, delete it
      this.replaceParts([], selection);
      return;
    }

    // backspace or delete from cursor
    if (backspace) {
      selection = this.cursorPosition.move(this.parts, 'prev', true);
    } else {
      selection = this.cursorPosition.move(this.parts, 'next', true);
    }

    if (selection.startIndex === selection.endIndex &&
      selection.startOffset === selection.endOffset) {
      // don't delete anything
      return;
    }

    // const currLength = this.parts.length;
    this.replaceParts([], selection);
  }

  private replaceParts(newParts: TextPart[], position: TextPartSelection = this.cursorPosition.get(), selectInsertion = false) {
    const { forwards, flipped } = this.cursorPosition.forwards(position);

    const { startIndex, startOffset, endIndex, endOffset, render } = this.parts.replaceParts(newParts, forwards);
    this.cursorPosition.set({
      startIndex: selectInsertion ? startIndex : endIndex,
      startOffset: selectInsertion ? startOffset : endOffset,
      endIndex,
      endOffset
    }, flipped);

    if (render) {
      // Manually update the span contents: I could not find an event
      // triggered by having the text rendered in an existing DOM
      // element. So update the span directly and update the selection
      // afterwards.
      this.renderText(this.partSpans.toArray());
    }
  }

  updateSelection() {
    this.cursorPosition.set(this.getCursorPosition());
  }

  toggleComment() {
    this.transcription.nativeElement.focus();
    const { forwards, flipped } = this.cursorPosition.forwards();
    const { startIndex, endIndex, endOffset } = this.parts.toggleHypo(forwards);

    this.cursorPosition.set({
      startIndex,
      startOffset: 0,
      endIndex,
      endOffset
    }, flipped);
  }
}
