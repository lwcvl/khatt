import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'kht-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  available = [
    'A book',
    'Some book title',
    'Yet another book title'
  ];

  results: string[];
  book = new FormControl('');
  filename: string;
  faUpload = faUpload;

  constructor() { }

  ngOnInit() {
  }

  search(event: { query: string }) {
    const search = event.query.toLowerCase();
    this.results = this.available.filter(t => t.toLowerCase().indexOf(search) >= 0);
  }

  detectFilename(fileInput: HTMLInputElement) {
    const files = fileInput.files;
    this.filename = files ? files[0].name : null;
  }
}
