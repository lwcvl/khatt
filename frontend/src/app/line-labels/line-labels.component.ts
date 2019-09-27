import { Component, EventEmitter, OnInit, Output, ViewChild, AfterViewChecked } from '@angular/core';
import { EditLabelComponent } from '../edit-label/edit-label.component';

@Component({
    selector: 'kht-line-labels',
    templateUrl: './line-labels.component.html',
    styleUrls: ['./line-labels.component.scss']
})
export class LineLabelsComponent implements OnInit, AfterViewChecked {
    @Output()
    blur = new EventEmitter();

    @ViewChild('editLabel', { static: false })
    editLabel: EditLabelComponent;

    adding = false;
    focusLabel = false;

    constructor() { }

    ngOnInit() {
    }

    ngAfterViewChecked() {
        if (this.adding && this.focusLabel) {
            // make sure the label has been drawn before focusing it.
            this.editLabel.focus();
            this.focusLabel = false;
        }
    }

    addTag() {
        this.adding = true;
        this.focusLabel = true;
    }

    cancelAdding() {
        this.adding = false;
        this.blur.next();
    }

}
