import { TextPartSelection, ForwardTextPartSelection, TextPartCollection } from './text-part-collection';

// different cursor movements
const movements = {
  home() {
    return {
      cursorIndex: 0,
      cursorOffset: 0
    };
  },
  end(parts: TextPartCollection) {
    const cursorIndex = parts.length - 1;
    return {
      cursorIndex,
      cursorOffset: (parts.byIndex(cursorIndex) || { text: '' }).text.length
    };
  },
  prev(parts: TextPartCollection, selection: Selection) {
    let cursorIndex: number;
    let cursorOffset: number;

    const absoluteOffset = parts.absoluteOffset(selection.endIndex, selection.endOffset);
    if (absoluteOffset > 0) {
      [cursorIndex, cursorOffset] = parts.relativeOffset(absoluteOffset - 1);
    }

    return { cursorIndex, cursorOffset };
  },
  next(parts: TextPartCollection, selection: Selection) {
    let cursorIndex: number;
    let cursorOffset: number;

    const absoluteOffset = parts.absoluteOffset(selection.endIndex, selection.endOffset);
    if (absoluteOffset < parts.text.length) {
      [cursorIndex, cursorOffset] = parts.relativeOffset(absoluteOffset + 1);
    }
    return { cursorIndex, cursorOffset };
  },
  prevWord(parts: TextPartCollection, selection: Selection) {
    let cursorIndex: number;
    let cursorOffset: number;

    const absoluteOffset = parts.absoluteOffset(selection.endIndex, selection.endOffset);
    const croppedText = parts.text.substring(0, absoluteOffset);
    const match = croppedText.match(/(\s[^\s]+\s*)$/);
    if (match) {
      [cursorIndex, cursorOffset] = parts.relativeOffset(croppedText.lastIndexOf(match.pop()) + 1);
    } else {
      cursorIndex = 0;
      cursorOffset = 0;
    }

    return { cursorIndex, cursorOffset };
  },
  nextWord(parts: TextPartCollection, selection: Selection) {
    let absoluteOffset = parts.absoluteOffset(selection.endIndex, selection.endOffset);
    const substring = parts.text.substring(absoluteOffset);
    const trimmedText = substring.trimStart();
    absoluteOffset += substring.length - trimmedText.length;

    const nextWord = trimmedText.search(/\s[^\s]/);
    if (nextWord >= 0) {
      const [cursorIndex, cursorOffset] = parts.relativeOffset(absoluteOffset + nextWord + 1);
      return { cursorIndex, cursorOffset };
    } else {
      return movements.end(parts);
    }
  }
};

export type Direction = keyof typeof movements;

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
    parts: TextPartCollection,
    direction: Direction,
    select: boolean) {
    const selection = this.get();

    const { cursorIndex, cursorOffset } = movements[direction](parts, selection);

    if (cursorIndex !== undefined) {
      selection.endIndex = cursorIndex;
      selection.endOffset = cursorOffset;

      if (!select) {
        selection.startIndex = cursorIndex;
        selection.startOffset = cursorOffset;
      }

      selection.forward = this.isForward(selection);
    }

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
