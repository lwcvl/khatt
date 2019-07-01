import { Component, OnInit, HostListener } from '@angular/core';
import {
  faChevronLeft,
  faChevronRight,
  faColumns,
  faDrawPolygon,
  faGripLines,
  faGripLinesVertical,
  faPencilAlt,
  faTrash,
  faVectorSquare
} from '@fortawesome/free-solid-svg-icons';

import { MarkMode } from '../models';

@Component({
  selector: 'kht-mark-manuscript',
  templateUrl: './mark-manuscript.component.html',
  styleUrls: ['./mark-manuscript.component.scss']
})
export class MarkManuscriptComponent implements OnInit {
  private shortcuts: { [key: string]: () => void } = {
    p: () => {/* previous page */ },
    n: () => {/* next page */ },
    s: () => this.toggleMode('square'),
    i: () => this.toggleMode('polygon'),
    l: () => this.toggleMode('lines'),
    d: () => this.toggleMode('pages'),
    v: () => this.toggleMode('vertical_lines'),
    r: () => this.toggleMode('remove'),
    esc: () => { this.mode = null; }
  };

  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faColumns = faColumns;
  faDrawPolygon = faDrawPolygon;
  faGripLines = faGripLines;
  faGripLinesVertical = faGripLinesVertical;
  faPencilAlt = faPencilAlt;
  faTrash = faTrash;
  faVectorSquare = faVectorSquare;

  mode: MarkMode | null = null;

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const action = this.shortcuts[event.key];
    if (action) {
      action();
    }
  }

  constructor() {
  }

  ngOnInit() {
  }

  toggleMode(mode: MarkMode) {
    this.mode = this.mode === mode ? null : mode;
  }
}
