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
                const lines = book.manuscripts.map( man => man.annotated_lines).flat(1);
                this.books[index]['lines'] = lines.filter(line => line.complete).length.toString() + "/" + lines.length.toString();
            });
        });
    }

}
