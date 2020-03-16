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

    constructor(private router: Router, private restangular: Restangular) { }

    ngOnInit() {
        const books = this.restangular.all('books');
        books.getList().subscribe(bookList => {
            this.books = bookList;
        });
    }

    viewBook(book: ListType<BooksComponent['books']>) {
        this.router.navigate(['/books/edit', book.id]);
    }
}
