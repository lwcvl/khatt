import { Injectable } from '@angular/core';
import { TextPart } from './models/text-part-collection';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  constructor() { }

  getParts(clipboardData: DataTransfer) {
    if (clipboardData.types.includes('text/html')) {
      const data = clipboardData.getData('text/html');
      return this.partsFromHtml(data);
    } else {
      const text = clipboardData.getData('text/plain');
      return [{
        text: text.replace(/(\t|\n\r?)/g, ' ').trim(),
        hypo: false
      }];
    }
  }

  private elementFromHtml(data: string) {
    let element: HTMLElement = document.createElement('div');
    element.innerHTML = data;
    const body = element.getElementsByTagName('body');
    if (body.length) {
      // only use the body
      element = body[0];
    }
    return element;
  }

  private partsFromHtml(data: string) {
    const element = this.elementFromHtml(data);

    // reconstruct the text and parts from the actual html
    const parts: TextPart[] = [];
    let lastPart: TextPart;
    let atStart = true;

    for (const part of this.partsFromElement(element)) {
      if (atStart) {
        if (/^\s*$/.test(part.text)) {
          // skip empty parts at the start
          continue;
        }

        part.text = part.text.trimStart();
        atStart = false;
      }

      // remove line breaks and tabs
      part.text = part.text.replace(/(\t|\n\r?)/g, ' ');

      if (lastPart && lastPart.hypo === part.hypo) {
        lastPart.text += part.text;
      } else {
        parts.push(part);
        lastPart = part;
      }
    }

    // trim end, empty parts at the start were already skipped
    this.trimPartsEnd(parts);

    return parts;
  }

  private trimPartsEnd(parts: TextPart[]): void {
    // go through the parts backwards until it has found the first
    // non-empty part, trim that and remove the rest
    for (let i = parts.length - 1; i >= 0; i--) {
      if (/^\s*$/.test(parts[i].text)) {
        // remove empty parts at the end
        delete parts[i];
      } else {
        // trim the final part
        parts[i].text = parts[i].text.trimEnd();
        break;
      }
    }
  }

  private * partsFromElement(element: HTMLElement, parentHypo: boolean = false): IterableIterator<TextPart> {
    // if its strict XML the tag name could be in lower case
    switch (element.tagName.toUpperCase()) {
      case 'HEAD':
      case 'STYLE':
      case 'SCRIPT':
        // don't include the text of these elements
        return;
    }

    parentHypo = parentHypo || this.htmlElementIsHypo(element);
    if (element.childElementCount === 0) {
      yield this.partFromNode(parentHypo, element);
      return;
    }

    for (const node of Array.from(element.childNodes)) {
      switch (node.nodeType) {
        case Node.TEXT_NODE:
        case Node.ENTITY_NODE:
        case Node.ENTITY_REFERENCE_NODE:
          yield this.partFromNode(parentHypo, node);
          break;

        case Node.ELEMENT_NODE:
          yield* this.partsFromElement(node as HTMLElement, parentHypo);
          break;

        default:
          console.error(`Unsupported node type ${node.nodeType}`);
      }
    }
  }

  private partFromNode(parentHypo: boolean, node: Node) {
    return {
      hypo: parentHypo || false,
      text: node.textContent
    };
  }

  private htmlElementIsHypo(element: HTMLElement) {
    if (element.className.includes('hypo')) {
      return true;
    }

    switch (element.tagName.toUpperCase()) {
      // if its strict XML the tag name could be in lower case
      case 'B':
      case 'STRONG':
      case 'U':
      case 'I':
        return true;
    }

    return false;
  }
}
