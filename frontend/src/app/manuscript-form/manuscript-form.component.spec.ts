import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ManuscriptFormComponent } from './manuscript-form.component';
import { AutoCompleteModule } from 'primeng/autocomplete';

describe('ManuscriptDetailsComponent', () => {
  let component: ManuscriptFormComponent;
  let fixture: ComponentFixture<ManuscriptFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManuscriptFormComponent ],
      imports: [AutoCompleteModule, FormsModule, ReactiveFormsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManuscriptFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
