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
    public lines;
    public asides;
    // readonly books = [{
    //     title: 'Some book name',
    //     author: 'Arthur the Author',
    //     chapters: '6/10',
    //     lines: '332/4532',
    //     asides: '71/325'
    // }, {
    //     title: 'Another book name',
    //     author: 'Another Author',
    //     chapters: '7/13',
    //     lines: '233/2354',
    //     asides: '66/346'
    // }];

    constructor(private restangular: Restangular) { }

    ngOnInit() {
        const books = this.restangular.all('books');
        books.getList().subscribe( bookList => {
            this.books = bookList;
            console.log(this.books);
            const lines = this.books.map( book => book.manuscripts.map( man => man.annotated_lines )).flat(2);
            this.lines = lines.filter(line => line.complete).length.toString() + "/" + lines.length.toString()
        });
    }

}
