import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'kht-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit {

    constructor(@Inject(DOCUMENT) private document: Document) { }

    ngOnInit() {
    }

    downloadAnnotations() {
        this.document.location.href = '/api/annotations/download/';
    }

}
