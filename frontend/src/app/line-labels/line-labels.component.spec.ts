import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineLabelsComponent } from './line-labels.component';

describe('LineLabelsComponent', () => {
    let component: LineLabelsComponent;
    let fixture: ComponentFixture<LineLabelsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LineLabelsComponent]
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
