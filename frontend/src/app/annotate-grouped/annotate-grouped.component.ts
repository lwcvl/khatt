import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { faChevronLeft, faChevronRight, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { Shape } from '../models/shapes';
import { Restangular } from 'ngx-restangular';


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

    constructor(private restangular: Restangular,
                private activatedRoute: ActivatedRoute,
                private router: Router) { }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe( params => {
            console.log(params.get('book'));
        });
        const annotatedLines = this.restangular.all('annotated_lines');
        annotatedLines.getList().subscribe( allLines => {
            this.highlightShapes = allLines;
            // we'll need information about which page should be loaded;
            // which manuscript it should be loaded from;
            // the x-y-width-height of the line
            // isChapter is false for annotatedLines
            // type is rectangle
        });
    }

    updateCount(index: number, count: number) {
        const diff = count - this.counts[index];
        for (let i = index; i < this.highlightShapes.length; i++) {
            this.offsets[i] += diff;
        }
    }

}
