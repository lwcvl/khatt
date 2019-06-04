import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing/app-routing.module';

import { AnnotateComponent } from './annotate/annotate.component';
import { AnnotateLineComponent } from './annotate-line/annotate-line.component';
import { BookComponent } from './book/book.component';
import { BooksComponent } from './books/books.component';
import { EditingComponent } from './editing/editing.component';
import { ManuscriptsComponent } from './manuscripts/manuscripts.component';
import { MarkManuscriptComponent } from './mark-manuscript/mark-manuscript.component';
import { UploadComponent } from './upload/upload.component';

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
    UploadComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
