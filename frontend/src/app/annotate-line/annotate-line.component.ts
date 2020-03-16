import { ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef, EventEmitter, Input, HostBinding, Output, OnChanges } from '@angular/core';
import { faComment, faCommentSlash, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import { HypoEditorComponent } from '../hypo-editor/hypo-editor.component';
import { Rectangle } from '../models/shapes';
import { Restangular } from 'ngx-restangular';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { AnimateChildOptions } from '@angular/animations';

const CONTAINER_WIDTH = 1344;
const PADDING_LEFT = 50;
const PADDING_TOP = 25;

@Component({
    selector: 'kht-annotate-line',
    templateUrl: './annotate-line.component.html',
    styleUrls: ['./annotate-line.component.scss']
})
export class AnnotateLineComponent implements OnInit, OnChanges {
    /**
     * SVG masks need a unique ID
     */
    static lineCounter = 0;

    faComment = faComment;
    faCommentSlash = faCommentSlash;
    faStickyNote = faStickyNote;

    maskId = `annotateLine${AnnotateLineComponent.lineCounter++}`;

    width = 1609;
    height = 1075;
    canvasHeight = 1075;

    viewBox: { x: number, y: number, width: number, height: number };

    showContext = false;

    @ViewChild('researchNotes', { static: true })
    researchNotes: ElementRef<HTMLTextAreaElement>;

    researchNotesHeight = '0';

    // TODO: other shapes
    @Input()
    shape: {manuscript: any, path: string, annotatedLine: any, highlight: Rectangle};

    @Input()
    offset = 0;

    @Output()
    changeLine: EventEmitter<boolean> = new EventEmitter();

    dir = 'ltr';

    maskPoints: string;

    @HostBinding('class')
    class = 'box is-paddingless';

    @ViewChild('canvas', { static: true })
    canvas: ElementRef<SVGImageElement>;

    @ViewChild('editor', { static: true })
    editor: HypoEditorComponent;

    isComplete: boolean;
    isHypo: boolean;

    public researchNoteText: string;
    public manuscript: any;
    public previousText = 'Previous line';
    public nextText = 'Next line';

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private restangular: Restangular) {
    }

    hypoChange(isHypo: boolean) {
        this.isHypo = isHypo;
        this.changeDetectorRef.detectChanges();
    }

    ngOnInit() {
        this.canvas.nativeElement.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        this.canvas.nativeElement.children[0].setAttributeNS(null, 'href', this.shape.path);

        const points = [{
            x: this.shape.highlight.x,
            y: this.shape.highlight.y
        },
        {
            x: this.shape.highlight.x + this.shape.highlight.width,
            y: this.shape.highlight.y
        },
        {
            x: this.shape.highlight.x + this.shape.highlight.width,
            y: this.shape.highlight.y + this.shape.highlight.height
        },
        {
            x: this.shape.highlight.x,
            y: this.shape.highlight.y + this.shape.highlight.height
        }];
        this.maskPoints = points.map(h => `${h.x},${h.y}`).join(' ');

        const boundingBox = { x1: this.width, y1: this.height, x2: 0, y2: 0 };
        for (const point of points) {
            if (point.x < boundingBox.x1) {
                boundingBox.x1 = point.x;
            }
            if (point.x > boundingBox.x2) {
                boundingBox.x2 = point.x;
            }
            if (point.y < boundingBox.y1) {
                boundingBox.y1 = point.y;
            }
            if (point.y > boundingBox.y2) {
                boundingBox.y2 = point.y;
            }
        }

        boundingBox.x1 = Math.max(0, boundingBox.x1 - PADDING_LEFT);
        boundingBox.y1 = Math.max(0, boundingBox.y1 - PADDING_TOP);
        boundingBox.x2 = Math.min(this.width, boundingBox.x2 + PADDING_LEFT);
        boundingBox.y2 = Math.min(this.height, boundingBox.y2 + PADDING_TOP);

        this.viewBox = {
            x: boundingBox.x1,
            y: boundingBox.y1,
            width: boundingBox.x2 - boundingBox.x1,
            height: boundingBox.y2 - boundingBox.y1
        };

        const scale = CONTAINER_WIDTH / (boundingBox.x2 - boundingBox.x1);
        this.canvasHeight = Math.ceil(-scale * (boundingBox.y1 - boundingBox.y2));
        this.canvas.nativeElement.setAttribute(
            'viewBox',
            `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);
    }

    ngOnChanges() {
        this.manuscript = this.shape.manuscript;
        const previous = this.shape.annotatedLine.previous_line;
        const next = this.shape.annotatedLine.next_line;
        if (previous !== null) {
            this.restangular.one('annotated_lines', previous).get().subscribe( line => {
                this.previousText = line.annotation.text.length > 0 ? line.annotation.text : 'Previous line';
            });
        }
        if (next !== null) {
            this.restangular.one('annotated_lines', next).get().subscribe( line => {
                this.nextText = line.annotation.text.length > 0 ? line.annotation.text : 'Next line';
            });
        }
    }

    toggleShowContext() {
        this.showContext = !this.showContext;
    }

    toggleResearchNotes() {
        if (this.researchNotesHeight === '0') {
            this.researchNotesHeight = `${this.researchNotes.nativeElement.offsetHeight}px`;
            this.researchNotes.nativeElement.focus();
        } else {
            this.researchNotesHeight = '0';
            const annID = this.shape.annotatedLine.annotation.id;
            this.restangular.one('annotations', annID).patch({research_note: this.researchNoteText});
        }
    }

    researchNotesKeydown(event: KeyboardEvent) {
        const keycode = event.which || event.keyCode;
        if (event.altKey) {
            switch (event.key) {
                case 'r':
                    this.toggleResearchNotes();
                    event.preventDefault();
                    this.editor.focus();
                    return false;
            }
        }
        return true;
    }

    moveNext() {
        if (this.shape.annotatedLine.next_line) {
            console.log(this.shape.annotatedLine.next_line);
            this.restangular.one('manuscripts', this.shape.manuscript.id).patch({
                currently_annotating: this.shape.annotatedLine.next_line
            });
            this.changeLine.emit(true);
        }
        this.saveComplete();
    }

    movePrevious() {
        if (this.shape.annotatedLine.previous_line) {
            this.restangular.one('manuscripts', this.shape.manuscript.id).patch({
                currently_annotating: this.shape.annotatedLine.previous_line
            });
            this.changeLine.emit(false);
        }
        this.saveComplete();
    }

    saveComplete() {
        this.restangular.one('annotations', this.shape.annotatedLine.annotation.id).patch({
            complete: this.isComplete
        });
    }
}

