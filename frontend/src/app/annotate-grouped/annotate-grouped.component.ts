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
                if (manuscript.annotations.filter(ann => ann.annotation_type === 'annotated_line').length > 0) {
                    const lineID = manuscript.currently_annotating;
                    this.restangular.one('annotated_lines', lineID).get().subscribe( line => {
                        const shape = this.generateShape(line, manuscript);
                        this.highlightShapes.push(shape);
                    });
                }
            });
        });
    }

    generateShape(line, manuscript) {
        const highlightShape = line.annotation.bounding_box;
        highlightShape.type = 'rectangle';
        highlightShape.isChapter = false;
        const url = '/api/manuscripts/' + manuscript.id.toString() + '/scan/' + line.annotation.page.toString() + '/';
        return {
            manuscript: manuscript,
            path: url,
            annotatedLine: line,
            highlight: highlightShape
        };
    }

    updateLines(forward: boolean) {
        this.highlightShapes.forEach((shape, index) => {
            const lineID = this.getLineID(shape, forward);
            this.restangular.one('annotated_lines', lineID).get().subscribe( line => {
                const newShape = this.generateShape(line, shape.manuscript);
                this.highlightShapes[index] = newShape;
            });
        });
    }

    getLineID(shape, forward: boolean) {
        if (forward) {
            return shape.annotatedLine.next_line;
        } else {
            return shape.annotatedLine.previous_line;
        }
    }

    updateCount(index: number, count: number) {
        const diff = count - this.counts[index];
        for (let i = index; i < this.highlightShapes.length; i++) {
            this.offsets[i] += diff;
        }
    }

}
