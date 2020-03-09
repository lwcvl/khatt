import { Component, OnInit } from '@angular/core';
import { Restangular } from 'ngx-restangular';

@Component({
    selector: 'kht-annotate',
    templateUrl: './annotate.component.html',
    styleUrls: ['./annotate.component.scss']
})
export class AnnotateComponent implements OnInit {
    public books;
    public chapters;
    public asides;

    constructor(private restangular: Restangular) { }

    ngOnInit() {
        const books = this.restangular.all('books');
        books.getList().subscribe( bookList => {
            this.books = bookList;
            this.books.forEach( (book, index) => {
                const annotations =  book.manuscripts.map( man => man.annotations).flat(1);
                const lines = annotations.filter( ann => ann.annotation_type === 'annotated_line');
                this.books[index].lines = lines.filter(line => line.complete).length.toString() + '/' + lines.length.toString();
            });
        });
    }

}
