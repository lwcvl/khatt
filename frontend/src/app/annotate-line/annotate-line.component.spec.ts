import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotateLineComponent } from './annotate-line.component';

describe('AnnotateLineComponent', () => {
  let component: AnnotateLineComponent;
  let fixture: ComponentFixture<AnnotateLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotateLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotateLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
