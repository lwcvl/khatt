import {
    AfterViewChecked,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';

@Component({
    selector: 'kht-edit-label',
    templateUrl: './edit-label.component.html',
    styleUrls: ['./edit-label.component.scss']
})
export class EditLabelComponent implements AfterViewChecked, OnChanges, OnInit {
    private changed = false;

    @Output()
    cancel = new EventEmitter();

    @Output()
    commit = new EventEmitter<string>();

    @Output()
    delete = new EventEmitter();

    @Output()
    edit = new EventEmitter();

    @Input()
    editing: boolean;

    @Input()
    label: string;

    @ViewChild('labelInput', { static: false })
    labelInput: ElementRef<HTMLInputElement>;

    constructor() { }

    ngAfterViewChecked() {
        if (this.changed) {
            this.focus();
            this.changed = false;
        }
    }

    ngOnChanges() {
        this.changed = true;
    }

    ngOnInit() {
    }

    onCommit() {
        this.commit.next(this.label);
    }

    onDelete() {
        this.delete.next();
    }

    onEdit() {
        this.edit.next();
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
                this.onCommit();
                return false;
        }
    }

    focus() {
        if (this.labelInput) {
            this.labelInput.nativeElement.focus();
        }
    }
}
