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
        s: () => this.toggleMode('square'),
        i: () => this.toggleMode('polygon'),
        l: () => this.toggleMode('lines'),
        d: () => this.toggleMode('pages'),
        v: () => this.toggleMode('vertical_lines'),
        r: () => this.toggleMode('remove'),
        esc: () => { this.mode = null; }
    };

    hasSquares: boolean;

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

    toggleChapter() {
        this.isChapter = !this.isChapter;
        if (!['square', 'polygon'].includes(this.mode)) {
            this.mode = 'square';
        }
    }

    toggleMode(mode: MarkMode) {
        this.mode = this.mode === mode ? null : mode;
        if (!['square', 'polygon'].includes(this.mode)) {
            this.isChapter = false;
        }
    }
}
