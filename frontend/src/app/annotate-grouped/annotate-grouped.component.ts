import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    highlightShapes: { 
        manuscript: any,
        path: string,
        annotatedLine: any,
        highlight: Shape
    } [] = [];
    bookID: number;

    book: any;

    constructor(private restangular: Restangular,
                private activatedRoute: ActivatedRoute) { }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe( params => {
            this.bookID = Number(params.get('book'));
        });
        this.restangular.one('books', this.bookID).get().subscribe(book => {
            this.book = book;
            book.manuscripts.forEach( manuscript => {
                if (manuscript.annotated_lines.length > 0 ) {
                    let lineID = Math.min.apply(Math, manuscript.annotated_lines.filter(line => !line.complete).map(line => Number(line.id)));
                    this.restangular.one('annotated_lines', lineID).get().subscribe( line => {
                        let highlightShape = line.annotation.bounding_box;
                        highlightShape['type'] = 'rectangle';
                        highlightShape['isChapter'] = false;
                        let url = '/api/manuscripts/' + manuscript.id.toString() + '/scan/' + line.annotation.page.toString() + '/'         
                        this.highlightShapes.push(
                            {
                                manuscript: manuscript,
                                path: url,
                                annotatedLine: line,
                                highlight: highlightShape
                            });
                    });
                }
            });
        });
    }

    updateCount(index: number, count: number) {
        const diff = count - this.counts[index];
        for (let i = index; i < this.highlightShapes.length; i++) {
            this.offsets[i] += diff;
        }
    }

}
