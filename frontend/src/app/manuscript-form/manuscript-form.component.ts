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
        this.available = this.restangular.all('books');
        console.log(this.available);
    }

    search(event: { query: string }) {
        const search = event.query.toLowerCase();
        this.results = this.available.filter(t => t.toLowerCase().includes(search));
    }
}
