import { CursorPosition } from './cursor-position';
import { BehaviorSubject } from 'rxjs';

export interface TextPart {
  text: string;
  hypo: boolean;
  id?: number;
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

  /**
   * Replaces text in an existing part.
   * @param index Part index.
   * @param text The text to insert.
   * @param startOffset The starting character position, text before is retained.
   * @param endOffset The final exclusive character position, text starting from this offset is retained.
   */
  replaceText(index: number, text: string, startOffset: number = 0, endOffset?: number) {
    const part = this.itemsList[index];
    part.text = part.text.substring(0, startOffset)
      + text
      + (endOffset !== undefined ? part.text.substring(endOffset) : '');
    return [part, startOffset + text.length] as [Readonly<TextPart>, number];
  }

  replaceParts(newParts: TextPart[], position: CursorPosition) {
    const updatedParts: TextPart[] = [];

    for (let i = 0; i < position.startIndex; i++) {
      // copy everything before the selection bounds
      updatedParts.push(this.itemsList[i]);
    }

    if (this.itemsList.length) {
      const startPart = this.itemsList[position.startIndex];
      const startText = startPart.text.substring(0, position.startOffset);
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
      const endPart = this.itemsList[position.endIndex];
      const endText = endPart.text.substring(position.endOffset);

      if (endText.length) {
        if (position.endIndex === position.startIndex && position.startOffset > 0) {
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

    for (let i = position.endIndex + 1; i < this.itemsList.length; i++) {
      // copy everything after the selection bounds
      updatedParts.push(this.itemsList[i]);
    }

    if (endIndex < 0) {
      // no negative index
      endIndex = 0;
    }

    this.itemsList = updatedParts;
    this.emit();

    return {
      startIndex,
      endIndex,
      endOffset
    };
  }

  /**
   * Get the nearest non-empty part and offset.
   */
  skipEmpty(index: number, offset: number) {
    while (index > 0 && this.itemsList[index].text.length === 0) {
      index--;
      offset = this.itemsList[index].text.length;
    }

    while (index < this.itemsList.length && this.itemsList[index].text.length === 0) {
      index++;
      offset = 0;
    }

    return [index, offset];
  }

  push(part: TextPart) {
    part.id = (this.itemsList ? this.partIds = 0 : this.partIds++);
    this.itemsList.push(part);
    this.emit();
  }

  toggleHypo(position: CursorPosition) {
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
    this.itemsSubject.next(this.itemsList);
  }
}
