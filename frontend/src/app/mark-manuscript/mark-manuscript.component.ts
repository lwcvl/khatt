import { Component, OnInit, HostListener } from '@angular/core';
import {
    faBookmark,
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

import { MarkMode } from '../models/mark-mode';
import { Shape } from '../models/shapes';

@Component({
    selector: 'kht-mark-manuscript',
    templateUrl: './mark-manuscript.component.html',
    styleUrls: ['./mark-manuscript.component.scss']
})
export class MarkManuscriptComponent implements OnInit {
    private shortcuts: { [key: string]: () => void } = {
        c: () => this.toggleChapter(),
        p: () => {/* previous page */ },
        n: () => {/* next page */ },
        s: () => this.toggleMode('rectangle'),
        i: () => this.toggleMode('polygon'),
        l: () => this.toggleMode('lines'),
        d: () => this.toggleMode('pages'),
        v: () => this.toggleMode('vertical_lines'),
        r: () => this.toggleMode('remove'),
        esc: () => { this.mode = null; }
    };

    hasRectangles: boolean;

    faBookmark = faBookmark;
    faChevronLeft = faChevronLeft;
    faChevronRight = faChevronRight;
    faColumns = faColumns;
    faDrawPolygon = faDrawPolygon;
    faGripLines = faGripLines;
    faGripLinesVertical = faGripLinesVertical;
    faPencilAlt = faPencilAlt;
    faTrash = faTrash;
    faVectorSquare = faVectorSquare;

    isChapter = false;
    mode: MarkMode | null = null;

    shapes: Shape[] = [];
    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        const action = this.shortcuts[event.key];
        if (action) {
            action();
        }
    }

    constructor() {
    }

    shapesChange(shapes: Shape[]) {
        this.shapes = shapes;
        this.hasRectangles = shapes.find(shape => shape.type === 'rectangle') !== undefined;
    }

    ngOnInit() {
    }

    toggleChapter() {
        this.isChapter = !this.isChapter;
        if (!['rectangle', 'polygon'].includes(this.mode)) {
            this.mode = 'rectangle';
        }
    }

    toggleMode(mode: MarkMode) {
        this.mode = this.mode === mode ? null : mode;
        if (!['rectangle', 'polygon'].includes(this.mode)) {
            this.isChapter = false;
        }
    }
}
