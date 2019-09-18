import { Component, OnInit } from '@angular/core';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'kht-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
    filename: string;
    faUpload = faUpload;

    constructor() { }

    ngOnInit() {
    }

    detectFilename(fileInput: HTMLInputElement) {
        const files = fileInput.files;
        this.filename = files ? files[0].name : null;
    }
}
