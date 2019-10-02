import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DragDropModule } from 'primeng/dragdrop';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing/app-routing.module';

import { AnnotateComponent } from './annotate/annotate.component';
import { AnnotateGroupedComponent } from './annotate-grouped/annotate-grouped.component';
import { AnnotateLineComponent } from './annotate-line/annotate-line.component';
import { BookComponent } from './book/book.component';
import { BooksComponent } from './books/books.component';
import { EditingComponent } from './editing/editing.component';
import { ManuscriptsComponent } from './manuscripts/manuscripts.component';
import { MarkManuscriptComponent } from './mark-manuscript/mark-manuscript.component';
import { MenuComponent } from './menu/menu.component';
import { UploadComponent } from './upload/upload.component';
import { EditManuscriptComponent } from './edit-manuscript/edit-manuscript.component';
import { PageMarkerComponent } from './page-marker/page-marker.component';
import { HypoEditorComponent } from './hypo-editor/hypo-editor.component';
import { ManuscriptFormComponent } from './manuscript-form/manuscript-form.component';
import { EditLabelComponent } from './edit-label/edit-label.component';
import { LineLabelsComponent } from './line-labels/line-labels.component';
import { MapChaptersComponent } from './map-chapters/map-chapters.component';
import { MapBookChaptersComponent } from './map-book-chapters/map-book-chapters.component';

@NgModule({
    declarations: [
        AppComponent,
        AnnotateComponent,
        AnnotateGroupedComponent,
        AnnotateLineComponent,
        BookComponent,
        BooksComponent,
        EditingComponent,
        MarkManuscriptComponent,
        ManuscriptsComponent,
        MenuComponent,
        UploadComponent,
        EditManuscriptComponent,
        PageMarkerComponent,
        HypoEditorComponent,
        ManuscriptFormComponent,
        EditLabelComponent,
        LineLabelsComponent,
        MapChaptersComponent,
        MapBookChaptersComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        FontAwesomeModule,
        AutoCompleteModule,
        DragDropModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
