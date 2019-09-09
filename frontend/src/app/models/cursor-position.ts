import { TextPartSelection, ForwardTextPartSelection, TextParts } from './text-parts';

export type Direction = 'home' | 'end' | 'prev' | 'next' | 'prev-word' | 'next-word';

interface Selection {
  startIndex: number;
  startOffset: number;
  endIndex: number;
  endOffset: number;
}

// The virtual cursor position might differ from the position in the DOM
// this is because in the DOM empty elements cannot be selected.
export class CursorPosition {
  private selection: Selection = {
    startIndex: 0,
    startOffset: 0,
    endIndex: 0,
    endOffset: 0
  };

  get(): TextPartSelection {
    return {
      forward: this.isForward(),
      ...this.selection
    };
  }

  forwards(selection: TextPartSelection = this.get()): {
    forwards: ForwardTextPartSelection,
    flipped: boolean
  } {
    const forward = this.isForward(selection);

    return {
      forwards: { ...(forward ? selection : this.flip(selection)), forward: true },
      flipped: !forward
    };
  }

  set(selection: Selection, flip: boolean = false) {
    this.selection = flip ? this.flip(selection) : selection;
    return this;
  }

  move(
    parts: TextParts,
    direction: Direction,
    select: boolean) {
    const selection = this.get();

    let cursorIndex: number;
    let cursorOffset: number;

    switch (direction) {
      case 'home':
        cursorIndex = 0;
        cursorOffset = 0;

        break;

      case 'end':
        cursorIndex = parts.length - 1;
        cursorOffset = parts.byIndex(cursorIndex).text.length;

        break;

      case 'prev':
        {
          const absoluteOffset = parts.absoluteOffset(selection.endIndex, selection.endOffset);
          if (absoluteOffset > 0) {
            [cursorIndex, cursorOffset] = parts.relativeOffset(absoluteOffset - 1);
          }
        }
        break;

      case 'next':
        {
          const absoluteOffset = parts.absoluteOffset(selection.endIndex, selection.endOffset);
          if (absoluteOffset < parts.text.length) {
            [cursorIndex, cursorOffset] = parts.relativeOffset(absoluteOffset + 1);
          }
        }
        break;

      case 'prev-word':
        {
          const absoluteOffset = parts.absoluteOffset(selection.endIndex, selection.endOffset);
          const croppedText = parts.text.substring(0, absoluteOffset);
          const match = croppedText.match(/(\b[^\s]+|\b[^\s]+\s+)$/);
          if (match) {
            [cursorIndex, cursorOffset] = parts.relativeOffset(croppedText.lastIndexOf(match.pop()));
            break;
          } else {
            cursorIndex = 0;
            cursorOffset = 0;
          }
        }
        break;

      case 'next-word':
        {
          const absoluteOffset = parts.absoluteOffset(selection.endIndex, selection.endOffset);
          const nextWord = parts.text.substring(absoluteOffset).search(/(?<!^)\s\b/);
          if (nextWord >= 0) {
            [cursorIndex, cursorOffset] = parts.relativeOffset(absoluteOffset + nextWord + 1);
          } else {
            return this.move(parts, 'end', select);
          }
        }
        break;
    }

    selection.endIndex = cursorIndex;
    selection.endOffset = cursorOffset;

    if (!select) {
      selection.startIndex = cursorIndex;
      selection.startOffset = cursorOffset;
    }

    selection.forward = this.isForward(selection);

    return this.selection = selection;
  }

  private isForward(selection: Selection = this.selection) {
    return selection.startIndex < selection.endIndex ||
      (selection.startIndex === selection.endIndex &&
        selection.startOffset <= selection.endOffset);
  }

  private flip(selection: Selection): TextPartSelection {
    return {
      startIndex: selection.endIndex,
      startOffset: selection.endOffset,
      endIndex: selection.startIndex,
      endOffset: selection.startOffset,
      forward: !this.isForward(selection)
    };
  }
}
