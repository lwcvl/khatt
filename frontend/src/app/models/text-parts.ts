import { BehaviorSubject } from 'rxjs';

export interface TextPart {
  text: string;
  hypo: boolean;
  id?: number;
}

/**
 * Note: a selection can also be backwards.
 */
export interface TextPartSelection {
  // index of the text part where the selection starts
  startIndex: number;
  startOffset: number;
  endIndex: number;
  endOffset: number;
  forward: boolean;
}

/**
 * The end should always follow the start for this selection type
 */
export interface ForwardTextPartSelection extends TextPartSelection {
  forward: true;
}


type ReadonlyTextPartIndex = Readonly<{ index: number } & TextPart>;

export class TextParts {
  private itemsList: TextPart[] = [];
  private itemsSubject = new BehaviorSubject<Readonly<TextPart>[]>(this.itemsList);

  // counter to be able to give each part a unique ID
  private partIds = 0;

  public items$ = this.itemsSubject.asObservable();

  get text() {
    return this.itemsList.reduce((prev, curr) => prev + curr.text, '');
  }

  get length() {
    return this.itemsList.length;
  }

  byId(id: number): ReadonlyTextPartIndex {
    const index = this.itemsList.findIndex(p => p.id === id);
    return {
      index,
      ... this.itemsList[index]
    };
  }

  byIndex(index: number): Readonly<TextPart> {
    return this.itemsList[index];
  }

  items(): ReadonlyTextPartIndex[] {
    return this.itemsList.map((part, index) => ({
      index,
      ...part
    }));
  }

  absoluteOffset(index: number, partOffset: number) {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.itemsList[i].text.length;
    }

    return offset + partOffset;
  }

  /**
   * Gets the part index and the offset within that part.
   * Returns [-1, 0] if the offset is out of range.
   * @param absoluteOffset Absolute offset from the start of the text
   */
  relativeOffset(absoluteOffset: number): [number, number] {
    let subOffset = 0;
    for (const [index, item] of this.itemsList.entries()) {
      subOffset += item.text.length;
      if (subOffset >= absoluteOffset) {
        return [index, absoluteOffset - subOffset + item.text.length];
      }
    }

    return [-1, 0];
  }

  composed(text: string, selection: ForwardTextPartSelection) {
    // currently assume 1 composed character
    const currentPart = this.itemsList[selection.endIndex];
    const updatedLocation = this.replaceParts([
      {
        text: text.substr(0, 1),
        hypo: this.itemsList.length && currentPart.hypo ||
          (selection.endIndex < this.itemsList.length - 1 &&
            selection.endOffset === currentPart.text.length &&
            this.itemsList[selection.endIndex + 1].hypo)
      }
    ], selection, true);

    // need to force redrawing everything, because if the compose action
    // replaced in the editable content, they aren't going to be redrawn
    // by themselves
    this.itemsList = this.itemsList.map(item => ({
      ...item
    }));
    this.emit();

    return updatedLocation;
  }

  /**
   * Replaces parts
   */
  replaceParts(newParts: TextPart[], selection: ForwardTextPartSelection, silent = false) {
    if (this.length && newParts.length === 1 &&
      selection.startIndex === selection.endIndex) {
      const part = this.itemsList[selection.startIndex];
      if (part.hypo === newParts[0].hypo) {
        // most common scenario when a user is typing and
        // adds just a single character to an existing part
        const text = newParts[0].text;

        part.text = part.text.substring(0, selection.startOffset)
          + text
          + (selection.endOffset !== undefined ? part.text.substring(selection.endOffset) : '');

        const textOffset = selection.startOffset + text.length;

        return {
          startIndex: selection.startIndex,
          startOffset: textOffset,
          endIndex: selection.endIndex,
          endOffset: textOffset,
          render: true
        };
      }
    }

    const updatedParts: TextPart[] = [];

    for (let i = 0; i < selection.startIndex; i++) {
      // copy everything before the selection bounds
      updatedParts.push(this.itemsList[i]);
    }

    if (this.itemsList.length) {
      const startPart = this.itemsList[selection.startIndex];
      const startText = startPart.text.substring(0, selection.startOffset);
      if (startText.length) {
        updatedParts.push({
          hypo: startPart.hypo,
          id: startPart.id,
          text: startText
        });
      }
    }

    const startIndex = updatedParts.length;

    let endIndex = updatedParts.length - 1;
    let endOffset = updatedParts.length ? updatedParts[endIndex].text.length : 0;

    for (const newPart of newParts) {
      newPart.id = this.partIds++;
      updatedParts.push(newPart);
      endIndex++;
      endOffset = newPart.text.length;
    }

    if (this.itemsList.length > 0) {
      const endPart = this.itemsList[selection.endIndex];
      const endText = endPart.text.substring(selection.endOffset);

      if (endText.length) {
        if (selection.endIndex === selection.startIndex && selection.startOffset > 0) {
          // split in two parts, two different ids needed
          updatedParts.push({
            id: this.partIds++,
            hypo: endPart.hypo,
            text: endText
          });
        } else {
          endPart.text = endText;
          updatedParts.push(endPart);
        }
      }
    }

    for (let i = selection.endIndex + 1; i < this.itemsList.length; i++) {
      // copy everything after the selection bounds
      updatedParts.push(this.itemsList[i]);
    }

    if (endIndex < 0) {
      // no negative index
      endIndex = 0;
    }

    const currLength = this.itemsList.length;
    this.itemsList = updatedParts;

    if (!silent) {
      this.emit();
    }

    return {
      startIndex,
      startOffset: 0,
      endIndex,
      endOffset,
      render: currLength === this.itemsList.length
    };
  }

  /**
   * Get the nearest non-empty part and offset.
   */
  skipEmpty(index: number, offset: number) {
    if (this.itemsList[index] && this.itemsList[index].text.length) {
      return [index, offset];
    }

    // go back until we go something
    while (index > 0 && this.itemsList[index] && this.itemsList[index].text.length === 0) {
      index--;
    }

    // everything preceding the cursor was empty
    if (this.itemsList[index] && this.itemsList[index].text.length) {
      // except the first
      offset = this.itemsList[index].text.length;
    } else {
      // try to go forward
      while (index < this.itemsList.length && this.itemsList[index].text.length === 0) {
        index++;
        offset = 0;
      }
    }

    return [index, offset];
  }

  /**
   * Gets the texted selected text parts.
   */
  *select(selection: ForwardTextPartSelection): Iterable<TextPart> {
    const first = this.itemsList[selection.startIndex];
    yield {
      id: first.id,
      hypo: first.hypo,
      text: first.text.substring(
        selection.startOffset,
        selection.startIndex === selection.endIndex ? selection.endOffset : undefined)
    };

    for (let i = selection.startIndex + 1; i < selection.endIndex; i++) {
      yield this.itemsList[i];
    }

    if (selection.endIndex > selection.startIndex) {
      const last = this.itemsList[selection.endIndex];
      yield {
        id: last.id,
        hypo: last.hypo,
        text: last.text.substring(0, selection.endOffset)
      };
    }
  }

  substring(selection: ForwardTextPartSelection) {
    return Array.from(this.select(selection)).map(part => part.text).join('');
  }

  push(part: TextPart) {
    part.id = (this.itemsList ? this.partIds = 0 : this.partIds++);
    this.itemsList.push(part);
    this.emit();
  }

  toggleHypo(position: ForwardTextPartSelection) {
    if (this.itemsList.length === 0) {
      this.push({
        hypo: true,
        text: ''
      });
      return position;
    }

    const currentPart = this.itemsList[position.startIndex];
    if (position.startIndex === position.endIndex &&
      position.startOffset === 0 &&
      currentPart.text.length === position.endOffset - 1) {
      // toggle the hypo class of the entire part
      currentPart.hypo = !currentPart.hypo;
      return;
    }

    let text = '';
    let hypo = false;

    for (let i = position.startIndex; i <= position.endIndex; i++) {
      const part = this.itemsList[i];
      if (!part.hypo) {
        hypo = true;
      }

      if (i === position.startIndex) {
        text += part.text.substring(position.startOffset, i === position.endIndex ? position.endOffset : undefined);
      } else if (i === position.endIndex) {
        text += part.text.substring(0, position.endOffset);
      } else {
        text += part.text;
      }
    }

    return this.replaceParts([{ text, hypo }], position);
  }

  private emit() {
    this.itemsSubject.next([...this.itemsList]);
  }
}
