import { Component, EventEmitter, OnInit, Input, Output, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'kht-edit-label',
    templateUrl: './edit-label.component.html',
    styleUrls: ['./edit-label.component.scss']
})
export class EditLabelComponent implements OnInit {
    @Output()
    cancel = new EventEmitter();

    @Output()
    delete = new EventEmitter();

    @Output()
    edit = new EventEmitter<string>();

    @Input()
    label: string;

    @ViewChild('labelInput', { static: true })
    labelInput: ElementRef<HTMLInputElement>;

    constructor() { }

    ngOnInit() {
    }

    onDelete() {
        this.delete.next();
    }

    keydown(event: KeyboardEvent) {
        const keycode = event.which || event.keyCode;
        switch (keycode) {
            case 27: // ESC
                event.preventDefault();
                this.cancel.next();
                return false;


            case 13: // ENTER
                event.preventDefault();
                this.edit.next(this.label);
                return false;
        }
    }

    focus() {
        this.labelInput.nativeElement.focus();
    }
}
