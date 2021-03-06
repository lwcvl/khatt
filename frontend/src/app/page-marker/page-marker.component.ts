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
import { MarkMode } from '../models/mark-mode';
import { Shape, Line, Mark, Rectangle, Polygon, TextLine } from '../models/shapes';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

const markClassNames = {
    dragging: 'is-dragging',
    hover: 'is-hover'
};

// even when the pointer is moved a little bit, this isn't seen as "two" clicks
const DELTA = 10;

// threshold for snapping a polygon for completion
const POLYGON_SNAP = 50;

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
    isChapter: boolean;

    @Input()
    mode: MarkMode;

    @Input()
    shapes: Readonly<Shape[]> = [];

    @Input() scanUrl: string;

    @Output()
    escape = new EventEmitter();

    @Output()
    shapesChange = new EventEmitter<Shape[]>();

    dragStart: { x: number, y: number };

    draftBlank = true;
    draftLines: Line[] = [];
    draftMarks: Mark[] = [];
    draftPoints: string;

    hoverMark: Mark;
    currentTextContainer: Rectangle | Polygon = undefined;

    shapeCounter = 0;

    @HostListener('document:keydown', ['$event'])
    keyDown(event: KeyboardEvent) {
        switch (event.key) {
            case 'Escape':
                if (this.draftBlank) {
                    this.escape.next();
                } else if (this.mode === 'polygon' && this.draftMarks.length > 2) {
                    this.draftMarks.splice(this.draftMarks.length - 2, 1);
                    this.drawDraftShapes();
                } else {
                    this.clearDraft();
                }
                break;
        }
    }

    @HostListener('document:pointermove', ['$event'])
    pointerMove(event: MouseEvent) {
        const { x, y } = this.getPointerPosition(event);

        // draw draft marks
        switch (this.mode) {
            case 'rectangle':
            case 'polygon':
                const draftMark: Mark = {
                    x, y, className: markClassNames.dragging
                };

                switch (this.draftMarks.length) {
                    case 0:
                        this.draftMarks.push(draftMark);
                        break;

                    default:
                        const lastIndex = this.draftMarks.length - 1;
                        const currentHover = this.hoverMark;
                        const drag = currentHover ? 0 : 1;

                        if (this.draftMarks.length >= 3 + drag) {
                            this.hoverMark = this.checkMarkHover(this.hoverMark, draftMark)
                                || this.checkMarkHover(this.draftMarks[0], draftMark)
                                || this.checkMarkHover(
                                    this.draftMarks[this.draftMarks.length - 1 - drag],
                                    draftMark); // skip checking against the mark being dragged (if it exists)
                        }

                        if (this.hoverMark) {
                            // hovering over the first point: the polygon could be completed
                            if (this.draftMarks[lastIndex].className.includes(markClassNames.dragging)) {
                                this.draftMarks.splice(lastIndex);
                            }
                        } else {
                            if (currentHover) {
                                currentHover.className = '';
                                this.draftMarks.push(draftMark);
                            } else {
                                this.draftMarks[lastIndex] = draftMark;
                            }
                        }
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

            case 'lines':
            case 'vertical_lines':
                const line = this.drawLine(x, y, this.mode === 'vertical_lines', 'text-line');
                this.draftLines = line ? [line] : [];
                break;
        }

        this.drawDraftShapes();
    }

    @HostListener('pointerdown', ['$event'])
    pointerDown(event: PointerEvent) {
        if (event.which !== 1) {
            return;
        }
        event.preventDefault();
        if (this.mode === 'remove') {
            const target = event.target as HTMLElement;
            if (target && target.id) {
                for (const shape of this.shapes) {
                    if (shape.id === target.id) {
                        this.removeShape(shape);
                    }
                }
                return;
            }
        }
        const { x, y } = this.getPointerPosition(event);
        this.dragStart = { x, y };
        this.handlePointerEvent(x, y);
    }

    @HostListener('pointerup', ['$event'])
    pointerUp(event: PointerEvent) {
        if (event.which !== 1) {
            return;
        }
        event.preventDefault();
        const { x, y } = this.getPointerPosition(event);
        if ((Math.abs(this.dragStart.x - x) + Math.abs(this.dragStart.y - y) > DELTA)) {
            this.handlePointerEvent(x, y);
        }
    }

    private checkMarkHover(mark: Mark, draftMark: Mark) {
        if (mark === undefined) {
            return undefined;
        }
        if (this.distance(mark, draftMark) < POLYGON_SNAP) {
            mark.className = markClassNames.hover;
            return mark;
        } else {
            mark.className = '';
            return undefined;
        }
    }

    private drawDraftShapes() {
        // draw draft shapes
        switch (this.mode) {
            case 'rectangle':
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
                    this.draftPoints = undefined;
                } else {
                    this.draftLines = [];
                    this.draftPoints = this.draftMarks.map(mark => `${mark.x},${mark.y}`).join(' ');
                }
        }
    }

    private handlePointerEvent(x: number, y: number) {
        switch (this.mode) {
            case 'rectangle':
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
                        this.shapesChange.next([
                            ...this.shapes,
                            {
                                id: this.getShapeId(),
                                type: 'rectangle',
                                isChapter: this.isChapter,
                                x: x1,
                                y: y1,
                                width: x2 - x1,
                                height: y2 - y1
                            }]);
                        break;
                }
                break;

            case 'polygon':
                if (this.draftMarks.length > 0) {
                    if (this.hoverMark) {
                        this.shapesChange.next([
                            ...this.shapes,
                            {
                                id: this.getShapeId(),
                                type: 'polygon',
                                isChapter: this.isChapter,
                                points: this.draftPoints,
                                marks: [...this.draftMarks]
                            }]);
                        this.clearDraft();
                    } else {
                        if (this.draftMarks.length > 2) {
                            // the marker is already being hovered on when it's placed
                            if (this.hoverMark) {
                                this.hoverMark.className = '';
                            }
                            this.hoverMark = this.draftMarks[this.draftMarks.length - 1];
                            this.hoverMark.className = markClassNames.hover;
                        } else if (this.draftMarks.length > 0) {
                            this.draftMarks[this.draftMarks.length - 1].className = '';
                        }

                        this.draftMarks.push({ x, y, className: markClassNames.dragging });
                    }
                }

                break;

            case 'pages':
                this.clearDraft();
                this.shapesChange.next([
                    ...this.shapes,
                    {
                        id: this.getShapeId(),
                        type: 'pages',
                        x
                    }]);
                break;

            case 'lines':
            case 'vertical_lines':
                if (this.currentTextContainer) {
                    this.shapesChange.next([
                        ...this.shapes,
                        ...this.draftLines.map<TextLine>(line => ({
                            id: this.getShapeId(),
                            type: 'text-line',
                            className: '',
                            parent: this.currentTextContainer,
                            x1: line.x1,
                            x2: line.x2,
                            y1: line.y1,
                            y2: line.y2
                        }))]);
                    this.draftLines = [];
                }
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
        this.hoverMark = undefined;
    }

    private drawLine(x: number, y: number, vertical: boolean, className: string): Line | void {
        // detect bounding box
        for (const shape of this.shapes) {
            switch (shape.type) {
                case 'rectangle':
                    if (x >= shape.x && y >= shape.y &&
                        x < (shape.x + shape.width) &&
                        y < (shape.y + shape.height) &&
                        this.checkLineDirection(shape, vertical)) {
                        this.currentTextContainer = shape;
                        return vertical ? {
                            className,
                            x1: x,
                            x2: x,
                            y1: shape.y,
                            y2: shape.y + shape.height
                        } : {
                                className,
                                x1: shape.x,
                                x2: shape.x + shape.width,
                                y1: y,
                                y2: y
                            };
                    }
                    break;
            }
        }
        this.currentTextContainer = undefined;
    }

    private checkLineDirection(parent: Rectangle, vertical: boolean) {
        for (const shape of this.shapes) {
            if (shape.type === 'text-line' && shape.parent === parent) {
                if ((shape.x1 === shape.x2) !== vertical) {
                    // misalignment!
                    return false;
                }
            }
        }

        return true;
    }

    private distance(a: { x: number, y: number }, b: { x: number, y: number }) {
        const distance = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
        return distance;
    }

    private getShapeId() {
        return `shape${this.shapeCounter++}`;
    }


    private removeShape(shape: Shape) {
        this.shapesChange.next(this.shapes.filter(s => s !== shape &&
            (s.type !== 'text-line' || s.parent !== shape)));
    }

    ngOnInit() {
        this.canvas.nativeElement.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        this.canvas.nativeElement.children[0].setAttributeNS(null, 'href', this.scanUrl);
    }

    ngOnChanges(changes: SimpleChanges) {
        const modeChange = changes.mode;
        if (modeChange && modeChange.previousValue !== modeChange.currentValue) {
            this.clearDraft();
        }
    }
}
