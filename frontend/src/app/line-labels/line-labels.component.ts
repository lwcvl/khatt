import { Component, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewChecked } from '@angular/core';
import { EditLabelComponent } from '../edit-label/edit-label.component';
import { Restangular } from 'ngx-restangular';

@Component({
    selector: 'kht-line-labels',
    templateUrl: './line-labels.component.html',
    styleUrls: ['./line-labels.component.scss']
})
export class LineLabelsComponent implements OnInit, AfterViewChecked {
    @Input() manuscript: any;
    @Input() annotation: any;
    @Output()
    blur = new EventEmitter();

    @ViewChild('editLabel', { static: false })
    editLabel: EditLabelComponent;

    labels: { text: string, original: string, editing: boolean }[] = [];
    adding = false;
    focusLabel = false;
    public lineIndex: number;
    public totalLines: any[];

    constructor(private restangular: Restangular) { }

    ngOnInit() {
        this.totalLines = this.manuscript.annotations.filter(line => line.annotation_type === 'annotated_line');
        this.lineIndex = this.totalLines.findIndex( line => line.id === this.annotation.id );
    }

    ngAfterViewChecked() {
        if (this.adding && this.focusLabel) {
            // make sure the label has been drawn before focusing it.
            this.editLabel.focus();
            this.focusLabel = false;
        }
    }

    add() {
        this.adding = true;
        this.focusLabel = true;
    }

    cancel(index: number) {
        const label = this.labels[index];
        this.labels[index] = Object.assign({},
            label,
            {
                text: label.original,
                editing: false
            });
        this.blur.next();
    }

    cancelAdding() {
        this.adding = false;
        this.blur.next();
    }

    commit(text: string, index: number = -1) {
        text = text.trim();
        this.restangular.one('annotations', this.annotation.id).patch({label: text});
        if (index >= 0) {
            const labels = [...this.labels];
            labels[index] = { text, original: text, editing: false };
            this.labels = labels;
        } else {
            this.labels = [...this.labels, { text, original: text, editing: false }];
            this.adding = false;
        }
        this.blur.next();
    }

    delete(index: number) {
        const labels = [...this.labels];
        labels.splice(index, 1);
        this.labels = labels;
        this.blur.next();
    }

    edit(index: number) {
        this.adding = false;
        const labels = [...this.labels];
        for (let i = 0; i < labels.length; i++) {
            labels[i].editing = i === index;
        }
        this.labels = labels;
    }
}
