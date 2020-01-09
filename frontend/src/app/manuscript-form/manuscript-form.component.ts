import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Restangular } from 'ngx-restangular';

@Component({
    selector: 'kht-manuscript-form',
    templateUrl: './manuscript-form.component.html',
    styleUrls: ['./manuscript-form.component.scss']
})
export class ManuscriptFormComponent implements OnInit {
    available: any[];
    results: string[];
    manuscriptForm: FormGroup;

    constructor(private restangular: Restangular, private fb: FormBuilder) { }

    ngOnInit() {
        // trailing slash is needed to make sure the route is understood by django
        const books = this.restangular.all('books/');
        books.getList().subscribe(bookList => {
            this.available = bookList.map(book => book.title);
        });

        this.manuscriptForm = this.fb.group({
            book: ['', Validators.required],
            title: ['', Validators.required],
            date: ['', Validators.required],
            textDirection: ['', Validators.required],
            pageDirection: ['', Validators.required],
            filename: ['', Validators.required]
        });
    }

    search(event: { query: string }) {
        const search = event.query.toLowerCase();
        this.results = this.available.filter(t => t.toLowerCase().includes(search));
    }

    uploadManuscript() {
        console.log(this.manuscriptForm.value);
    }
}
