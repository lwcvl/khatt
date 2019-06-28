import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing/app-routing.module';

import { AnnotateComponent } from './annotate/annotate.component';
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

@NgModule({
  declarations: [
    AppComponent,
    AnnotateComponent,
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
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    AutoCompleteModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
