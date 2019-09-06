import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HypoEditorComponent } from './hypo-editor.component';

describe('HypoEditorComponent', () => {
  let component: HypoEditorComponent;
  let fixture: ComponentFixture<HypoEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HypoEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HypoEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
