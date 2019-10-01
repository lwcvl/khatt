import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapChaptersComponent } from './map-chapters.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('MapChaptersComponent', () => {
    let component: MapChaptersComponent;
    let fixture: ComponentFixture<MapChaptersComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MapChaptersComponent],
            imports: [RouterTestingModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MapChaptersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
