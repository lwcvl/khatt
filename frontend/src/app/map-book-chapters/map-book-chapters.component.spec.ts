import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapBookChaptersComponent } from './map-book-chapters.component';

describe('MapBookChaptersComponent', () => {
  let component: MapBookChaptersComponent;
  let fixture: ComponentFixture<MapBookChaptersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapBookChaptersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapBookChaptersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
