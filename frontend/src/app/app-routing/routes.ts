import { Routes } from '@angular/router';

import { BookComponent } from '../book/book.component';
import { BooksComponent } from '../books/books.component';
import { EditManuscriptComponent } from '../edit-manuscript/edit-manuscript.component';
import { ManuscriptsComponent } from '../manuscripts/manuscripts.component';
import { MarkManuscriptComponent } from '../mark-manuscript/mark-manuscript.component';
import { UploadComponent } from '../upload/upload.component';

const routes: Routes = [
  {
    path: 'upload',
    component: UploadComponent
  },
  {
    path: 'book',
    component: BookComponent,
  },
  {
    path: 'books',
    component: BooksComponent,
  },
  {
    path: 'manuscripts',
    component: ManuscriptsComponent
  },
  {
    path: 'edit-manuscript',
    component: EditManuscriptComponent
  },
  {
    path: 'mark-manuscript',
    component: MarkManuscriptComponent
  },
  {
    path: '',
    redirectTo: '/books',
    pathMatch: 'full'
  }
];

export { routes };
