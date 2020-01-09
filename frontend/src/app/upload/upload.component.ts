import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { Restangular } from 'ngx-restangular';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'kht-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
    filename: string;
    faUpload = faUpload;
    manuscript: any;
    @Input() manuscriptForm: FormGroup;

    constructor(private restangular: Restangular) { }

    ngOnInit() {
        this.manuscript = this.restangular.all('manuscripts/');
    }

    detectFilename(fileInput: HTMLInputElement) {
        const files = fileInput.files;
        this.filename = files ? files[0].name : null;
    }
}
