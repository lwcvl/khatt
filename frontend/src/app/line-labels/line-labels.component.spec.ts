import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { LineLabelsComponent } from './line-labels.component';
import { EditLabelComponent } from '../edit-label/edit-label.component';

describe('LineLabelsComponent', () => {
    let component: LineLabelsComponent;
    let fixture: ComponentFixture<LineLabelsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditLabelComponent, LineLabelsComponent],
            imports: [FormsModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LineLabelsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
