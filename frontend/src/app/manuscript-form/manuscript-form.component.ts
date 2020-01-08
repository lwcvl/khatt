import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Restangular } from 'ngx-restangular';

@Component({
    selector: 'kht-manuscript-form',
    templateUrl: './manuscript-form.component.html',
    styleUrls: ['./manuscript-form.component.scss']
})
export class ManuscriptFormComponent implements OnInit {
    available: any[];

    results: string[];
    book = new FormControl('');

    constructor(private restangular: Restangular) { }

    ngOnInit() {
        let books;
        // trailing slash is needed to make sure the route is understood by django
        books = this.restangular.all('books/');
        books.getList().subscribe(bookList => {
            this.available = bookList.map(book => book.title);
        });
    }

    search(event: { query: string }) {
        const search = event.query.toLowerCase();
        this.results = this.available.filter(t => t.toLowerCase().includes(search));
    }
}
