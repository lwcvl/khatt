import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListType } from '../lib';

import { Restangular } from 'ngx-restangular';

@Component({
    selector: 'kht-books',
    templateUrl: './books.component.html',
    styleUrls: ['./books.component.scss']
})
export class BooksComponent implements OnInit {
    books: any[];
    // readonly books = [{
    //     title: 'Some book name',
    //     author: 'Arthur the Author',
    //     manuscripts: 6,
    //     annotatedLines: '332/4532'
    // }, {
    //     title: 'Another book name',
    //     author: 'Another Author',
    //     manuscripts: 3,
    //     annotatedLines: '233/2354'
    // }];

    constructor(private router: Router, private restangular: Restangular) { }

    ngOnInit() {
        const books = this.restangular.all('books');
        books.getList().subscribe(bookList => {
            this.books = bookList;
        });
    }

    viewBook(book: ListType<BooksComponent['books']>) {
        this.router.navigate(['/books/edit']);
    }
}
