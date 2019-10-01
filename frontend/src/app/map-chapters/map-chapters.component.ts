import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'kht-map-chapters',
  templateUrl: './map-chapters.component.html',
  styleUrls: ['./map-chapters.component.scss']
})
export class MapChaptersComponent implements OnInit {
    readonly books = [{
        title: 'Some book name',
        author: 'Arthur the Author',
        chapters: '6/10'
    }, {
        title: 'Another book name',
        author: 'Another Author',
        chapters: '7/13'
    }];


  constructor() { }

  ngOnInit() {
  }

}
