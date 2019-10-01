import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AutoCompleteModule } from 'primeng/autocomplete';

import { EditManuscriptComponent } from './edit-manuscript.component';
import { ManuscriptFormComponent } from '../manuscript-form/manuscript-form.component';

describe('EditManuscriptComponent', () => {
    let component: EditManuscriptComponent;
    let fixture: ComponentFixture<EditManuscriptComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditManuscriptComponent, ManuscriptFormComponent],
            imports: [AutoCompleteModule, FormsModule, ReactiveFormsModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditManuscriptComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
