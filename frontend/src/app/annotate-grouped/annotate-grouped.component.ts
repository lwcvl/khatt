import { Component, OnInit } from '@angular/core';
import { faChevronLeft, faChevronRight, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { Shape } from '../models/shapes';

@Component({
    selector: 'kht-annotate-grouped',
    templateUrl: './annotate-grouped.component.html',
    styleUrls: ['./annotate-grouped.component.scss']
})
export class AnnotateGroupedComponent implements OnInit {
    faChevronLeft = faChevronLeft;
    faChevronRight = faChevronRight;
    faPencilAlt = faPencilAlt;

    counts = {
        0: 1,
        1: 1
    };
    offsets = {
        0: 1,
        1: 2
    };
    highlightShapes: Shape[] = [
        {
            id: '1',
            type: 'rectangle',
            x: 867,
            y: 109,
            width: 561,
            height: 42,
            isChapter: false
        },
        {
            id: '2',
            type: 'rectangle',
            x: 861,
            y: 485,
            width: 549,
            height: 48,
            isChapter: false
        }];

    constructor() { }

    ngOnInit() {
    }

    updateCount(index: number, count: number) {
        const diff = count - this.counts[index];
        for (let i = index; i < this.highlightShapes.length; i++) {
            this.offsets[i] += diff;
        }
    }

}
