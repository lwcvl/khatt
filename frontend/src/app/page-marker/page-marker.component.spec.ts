import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageMarkerComponent } from './page-marker.component';

describe('PageMarkerComponent', () => {
  let component: PageMarkerComponent;
  let fixture: ComponentFixture<PageMarkerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageMarkerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
