import { Component, OnInit } from '@angular/core';
import { faChevronLeft, faChevronRight, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'kht-annotate',
    templateUrl: './annotate.component.html',
    styleUrls: ['./annotate.component.scss']
})
export class AnnotateComponent implements OnInit {
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
    highlightShapes = [
        [
            { x: 867, y: 109 },
            { x: 1428, y: 109 },
            { x: 1428, y: 151 },
            { x: 867, y: 151 }],
        [
            { x: 861, y: 485 },
            { x: 1410, y: 485 },
            { x: 1410, y: 533 },
            { x: 861, y: 533 }]];

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
