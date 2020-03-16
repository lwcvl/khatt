import { Component, OnInit } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { ActivatedRoute } from '@angular/router';
import { AnimationQueryMetadata } from '@angular/animations';

@Component({
  selector: 'kht-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {
    book: any;
    bookID: number;
    manuscripts: [];

    constructor(private activatedRoute: ActivatedRoute, private restAngular: Restangular) { }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe( params => {
            this.bookID = Number(params.get('book'));
        });
        this.restAngular.one('books', this.bookID).get().subscribe( book => {
            this.book = book;
            this.manuscripts = book.manuscripts;
        });
    }

}
