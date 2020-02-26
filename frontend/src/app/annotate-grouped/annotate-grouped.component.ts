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
        path: string,
        highlight: Shape
    } [] = [];
    bookID: number;

    constructor(private restangular: Restangular,
                private activatedRoute: ActivatedRoute) { }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe( params => {
            this.bookID = Number(params.get('book'));
        });
        this.restangular.one('books', this.bookID).get().subscribe(book => {
            book.manuscripts.forEach( manuscript => {
                if (manuscript.annotated_lines.length > 0 ) {
                    let lineID = Number(manuscript.annotated_lines.find(line => !line.complete).id);
                    this.restangular.one('annotated_lines', lineID).get().subscribe( line => {
                        let highlightShape = line.bounding_box;
                        highlightShape['type'] = 'rectangle';
                        highlightShape['isChapter'] = false;                  
                        this.highlightShapes.push(
                            {path: manuscript.filepath,
                            highlight: highlightShape});
                    });
                }
                console.log(this.highlightShapes);
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
