import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ListType } from '../lib';

@Component({
    selector: 'kht-books',
    templateUrl: './books.component.html',
    styleUrls: ['./books.component.scss']
})
export class BooksComponent {
    readonly books = [{
        title: 'Some book name',
        author: 'Arthur the Author',
        manuscripts: 6,
        annotatedLines: '332/4532'
    }, {
        title: 'Another book name',
        author: 'Another Author',
        manuscripts: 3,
        annotatedLines: '233/2354'
    }];

    constructor(private router: Router) { }

    viewBook(book: ListType<BooksComponent['books']>) {
        this.router.navigate(['/books/edit']);
    }
}
