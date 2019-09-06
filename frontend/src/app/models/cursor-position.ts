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
    const { forwards, flipped } = this.forwards();

    switch (direction) {
      case 'home':
        forwards.startIndex = 0;
        forwards.startOffset = 0;

        if (!select) {
          forwards.endIndex = 0;
          forwards.endOffset = 0;
        }
        break;

      case 'end':
        forwards.endIndex = parts.length - 1;
        forwards.endOffset = parts.byIndex(forwards.endIndex).text.length;

        if (!select) {
          forwards.startIndex = forwards.endIndex;
          forwards.startOffset = forwards.endOffset;
        }
        break;
    }

    return this.selection = flipped ? this.flip(forwards) : forwards;
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
