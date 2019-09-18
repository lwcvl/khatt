import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManuscriptFormComponent } from './manuscript-form.component';

describe('ManuscriptDetailsComponent', () => {
  let component: ManuscriptFormComponent;
  let fixture: ComponentFixture<ManuscriptFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManuscriptFormComponent ]
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
