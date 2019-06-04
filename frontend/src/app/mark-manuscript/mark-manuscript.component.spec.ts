import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkManuscriptComponent } from './mark-manuscript.component';

describe('MarkManuscriptComponent', () => {
  let component: MarkManuscriptComponent;
  let fixture: ComponentFixture<MarkManuscriptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkManuscriptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkManuscriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
