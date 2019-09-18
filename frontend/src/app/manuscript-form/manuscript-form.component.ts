import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'kht-manuscript-form',
    templateUrl: './manuscript-form.component.html',
    styleUrls: ['./manuscript-form.component.scss']
})
export class ManuscriptFormComponent implements OnInit {
    available = [
        'A book',
        'Some book title',
        'Yet another book title'
    ];

    results: string[];
    book = new FormControl('');

    constructor() { }

    ngOnInit() {
    }

    search(event: { query: string }) {
        const search = event.query.toLowerCase();
        this.results = this.available.filter(t => t.toLowerCase().includes(search));
    }
}
