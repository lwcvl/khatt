import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';

import { MapBookChaptersComponent } from './map-book-chapters.component';
import { DragDropModule } from 'primeng/dragdrop';

describe('MapBookChaptersComponent', () => {
    let component: MapBookChaptersComponent;
    let fixture: ComponentFixture<MapBookChaptersComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [DragDropModule, RouterTestingModule, FormsModule],
            declarations: [MapBookChaptersComponent]
        }).compileComponents();
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
