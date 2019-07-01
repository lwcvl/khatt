import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { MarkMode } from '../models';

const markClassNames = {
  dragging: 'is-dragging'
};

// even when the pointer is moved a little bit, this isn't seen as "two" clicks
const DELTA = 10;

@Component({
  selector: 'kht-page-marker',
  templateUrl: './page-marker.component.html',
  styleUrls: ['./page-marker.component.scss']
})
export class PageMarkerComponent implements OnChanges, OnInit {

  constructor() {
  }

  width = 1609;
  height = 1075;

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<SVGImageElement>;

  @Input()
  mode: MarkMode;

  @Output()
  escape = new EventEmitter();

  dragStart: { x: number, y: number };

  draftBlank = true;
  draftLines: Line[] = [];
  draftMarks: Mark[] = [];
  draftPoints: string;
  shapes: Shape[] = [];

  @HostListener('document:keydown', ['$event'])
  keyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        if (this.draftBlank) {
          this.escape.next();
        }
        this.clearDraft();
        break;
    }
  }

  @HostListener('document:pointermove', ['$event'])
  mouseMove(event: MouseEvent) {
    const { x, y } = this.getPointerPosition(event);

    // draw draft marks
    switch (this.mode) {
      case 'square':
      case 'polygon':
        const draftMark: Mark = {
          x, y, className: markClassNames.dragging
        };

        switch (this.draftMarks.length) {
          case 0:
            this.draftMarks.push(draftMark);
            break;

          default:
            this.draftMarks[this.draftMarks.length - 1] = draftMark;
            break;
        }

        if (this.draftMarks.length > 1) {
          this.draftBlank = false;
        }
        break;

      case 'pages':
        this.draftLines = [{
          className: 'pages',
          x1: x,
          x2: x,
          y1: 0,
          y2: this.height
        }];
        break;
    }

    // draw draft shapes
    switch (this.mode) {
      case 'square':
        if (this.draftMarks.length === 2) {
          const origin = this.draftMarks[0];
          const exit = this.draftMarks[1];

          this.draftPoints = `${origin.x},${origin.y} ${exit.x},${origin.y} ${exit.x},${exit.y} ${origin.x},${exit.y}`;
        }
        break;

      case 'polygon':
        if (this.draftMarks.length === 2) {
          this.draftLines = [{
            x1: this.draftMarks[0].x,
            x2: this.draftMarks[1].x,
            y1: this.draftMarks[0].y,
            y2: this.draftMarks[1].y,
            className: ''
          }];
        } else {
          this.draftLines = [];
          this.draftPoints = this.draftMarks.map(mark => `${mark.x},${mark.y}`).join(' ');
        }
    }
  }

  @HostListener('pointerdown', ['$event'])
  pointerDown(event: PointerEvent) {
    const { x, y } = this.getPointerPosition(event);
    this.dragStart = { x, y };
    this.handleMouseEvent(x, y);
  }

  @HostListener('document:pointerup', ['$event'])
  pointerUp(event: PointerEvent) {
    const { x, y } = this.getPointerPosition(event);
    if ((Math.abs(this.dragStart.x - x) + Math.abs(this.dragStart.y - y) > DELTA)) {
      this.handleMouseEvent(x, y);
    }
  }

  handleMouseEvent(x: number, y: number) {
    switch (this.mode) {
      case 'square':
        switch (this.draftMarks.length) {
          case 1:
            this.draftMarks[0].className = '';
            this.draftMarks.push({ x, y, className: markClassNames.dragging });
            break;

          case 2:
            let x1 = this.draftMarks[0].x;
            let y1 = this.draftMarks[0].y;
            let x2 = this.draftMarks[1].x;
            let y2 = this.draftMarks[1].y;
            if (x1 > x2) {
              const x3 = x1;
              x1 = x2;
              x2 = x3;
            }
            if (y1 > y2) {
              const y3 = y1;
              y1 = y2;
              y2 = y3;
            }
            this.clearDraft();
            this.shapes.push({
              type: 'square',
              x: x1,
              y: y1,
              width: x2 - x1,
              height: y2 - y1
            });
            break;
        }
        break;

      case 'polygon':
        if (this.draftMarks.length > 0) {
          if (this.draftMarks.length < 4) {
            this.draftMarks[this.draftMarks.length - 1].className = '';
            this.draftMarks.push({ x, y, className: markClassNames.dragging });
          } else {
            this.shapes.push({
              type: 'polygon',
              points: this.draftPoints,
              marks: [...this.draftMarks]
            });
            this.clearDraft();
          }
        }

        break;

      case 'pages':
        this.clearDraft();
        this.shapes.push({ type: 'pages', x });
        break;
    }
  }

  private getPointerPosition(event: MouseEvent) {
    const { width, height } = this.canvas.nativeElement;
    const { offsetX, offsetY } = event;

    const x = Math.round((offsetX / width.baseVal.value) * this.width);
    const y = Math.round((offsetY / height.baseVal.value) * this.height);

    return { x, y };
  }

  private clearDraft() {
    this.draftBlank = true;
    this.draftLines = [];
    this.draftMarks = [];
    this.draftPoints = undefined;
  }

  ngOnInit() {
    this.canvas.nativeElement.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
  }

  ngOnChanges(changes: SimpleChanges) {
    const modeChange = changes.mode;
    if (modeChange.previousValue !== modeChange.currentValue) {
      this.clearDraft();
    }
  }

}

interface Line { x1: number; y1: number; x2: number; y2: number; className: string; }
interface Mark { x: number; y: number; className: string; }
interface Square { type: 'square'; x: number; y: number; width: number; height: number; }
interface Polygon { type: 'polygon'; points: string; marks: Mark[]; }
interface Pages { type: 'pages'; x: number; }
type Shape = Square | Polygon | Pages;
