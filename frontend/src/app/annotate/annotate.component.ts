import { Component, OnInit } from '@angular/core';
import { Restangular } from 'ngx-restangular';

@Component({
    selector: 'kht-annotate',
    templateUrl: './annotate.component.html',
    styleUrls: ['./annotate.component.scss']
})
export class AnnotateComponent implements OnInit {
    readonly books = [{
        title: 'Some book name',
        author: 'Arthur the Author',
        chapters: '6/10',
        lines: '332/4532',
        asides: '71/325'
    }, {
        title: 'Another book name',
        author: 'Another Author',
        chapters: '7/13',
        lines: '233/2354',
        asides: '66/346'
    }];

    constructor(private restangular: Restangular) { }

    ngOnInit() {
        
    }

}
