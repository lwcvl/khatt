import { Injectable } from '@angular/core';
import { TextPart } from './models/text-parts';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  constructor() { }

  getParts(clipboardData: DataTransfer) {
    const parts: TextPart[] = [];

    if (clipboardData.types.indexOf('text/html') >= 0) {
      const data = clipboardData.getData('text/html');

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

        if (lastPart && lastPart.hypo === part.hypo) {
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
      const text = clipboardData.getData('text/plain');
      parts.push({
        text: text.replace(/(\t|\n\r?)/g, ' ').trim(),
        hypo: false
      });
    }

    return parts;
  }


  private * partsFromHtml(element: HTMLElement, parentHypo?: boolean): IterableIterator<TextPart> {
    switch (element.tagName) {
      case 'HEAD':
      case 'STYLE':
      case 'SCRIPT':
        // don't include the text of these elements
        return;
    }

    parentHypo = this.htmlElementIsHypo(element) ? true : parentHypo;
    if (element.childElementCount === 0) {
      yield {
        hypo: parentHypo || false,
        text: element.textContent
      };
      return;
    }

    for (const node of Array.from(element.childNodes)) {
      switch (node.nodeType) {
        case Node.TEXT_NODE:
        case Node.ENTITY_NODE:
        case Node.ENTITY_REFERENCE_NODE:
          yield {
            hypo: parentHypo || false,
            text: node.textContent
          };
          break;

        case Node.ELEMENT_NODE:
          yield* this.partsFromHtml(node as HTMLElement, parentHypo);
          break;

        default:
          console.error(`Unsupported node type ${node.nodeType}`);
      }
    }
  }

  private htmlElementIsHypo(element: HTMLElement) {
    if (element.className.indexOf('hypo') >= 0) {
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
}
