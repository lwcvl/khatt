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
import { Restangular } from 'ngx-restangular';

import { MarkMode } from '../models/mark-mode';
import { TextLine, Shape } from '../models/shapes';
import { text } from '@fortawesome/fontawesome-svg-core';
import { pbkdf2 } from 'crypto';
import { ActivatedRoute } from '@angular/router';

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

    private manuscriptID: number;
    public title: string;
    public scanUrl: string;

    shapes: Shape[] = [];
    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        const action = this.shortcuts[event.key];
        if (action) {
            action();
        }
    }

    constructor(private activatedRoute: ActivatedRoute, private restangular: Restangular) {
    }

    shapesChange(shapes: Shape[]) {
        this.shapes = shapes;
        this.hasRectangles = shapes.find(shape => shape.type === 'rectangle') !== undefined;
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe( params => {
            this.manuscriptID = Number(params.get('manuscript'));
        });       
        this.restangular.one('manuscripts', this.manuscriptID).get().subscribe( manuscript => {
            this.title = manuscript.title;
            this.scanUrl = '/api/manuscripts/' + this.manuscriptID.toString() + '/scan/' + manuscript.currently_marking.toString() + '/';
        });
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

    saveShapes() {
        const lines = this.shapes.filter( shape => shape.type === 'text-line') as TextLine[];
        if (lines) {
            const textFields = this.restangular.all('text_fields');
            textFields.post({
                manuscript_id: this.manuscriptID,
                bounding_box: lines[0].parent
            }).subscribe(response => this.saveLines(lines, response.id));
        }
    }

    saveLines(lines, textFieldID) {
    const annotatedLines = this.restangular.all('annotated_lines');
    if ( lines[0].y1 === lines[0].y2 ) {
        // horizontal line
        const top = lines[0].parent.type === 'rectangle' ? lines[0].parent.y :
            Math.min.apply(Math, lines[0].parent.marks.map( point => point.y));
        lines.sort( (a, b) => a.y1 - b.y1 );
        const firstline = {
            x: lines[0].x1,
            y: lines[0].y1,
            width: lines[0].x2 - lines[0].x1,
            height: lines[0].y1 - top
        };
        annotatedLines.post({
            text_field: textFieldID,
            bounding_box: firstline
        });
        if (lines.length > 1) {
            lines.forEach( (line, index) => {
                if (index > 0) {
                    annotatedLines.post({
                        text_field: textFieldID,
                        bounding_box: {
                            x: line.x1,
                            y: line.y1,
                            width: line.x2 - line.x1,
                            height: line.y1 - lines[index - 1].y1
                        }
                    });
                }
            });
        }
    } else {
        const left = lines[0].parent.type === 'rectangle' ? lines[0].parent.x :
            Math.min.apply(Math, lines[0].parent.marks.map( point => point.x));
        lines.sort( (a, b) => a.x1 - b.x1 );
        const firstline = {
            x: lines[0].x1,
            y: lines[0].y1,
            width: lines[0].x1 - left,
            height: lines[0].y2 - lines[0].y1
        };
        annotatedLines.post({
            text_field: textFieldID,
            bounding_box: firstline
        });
        if (lines.length > 1) {
            lines.forEach( (line, index) => {
                if (index > 0) {
                    annotatedLines.post({
                        text_field: textFieldID,
                        bounding_box: {
                            x: line.x1,
                            y: line.y1,
                            width: line.x1 - lines[index - 1].x1,
                            height: line.y2 - line.y1
                        }
                    });
                }
            });
        }
    }}
}
